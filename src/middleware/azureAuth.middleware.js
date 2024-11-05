const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const { UserEntity } = require("../db/entity/user.entity");
const { AzureAuthService } = require("./azureAuth.service");
const EnvironmentService = require("../shared/environment.service");
const { StaticStrings } = require("../shared/static.string");
const { getRepository } = require("typeorm");
const boom = require("@hapi/boom");

class AzureAuthMiddleware {
  #excludedPaths;
  #optionalUserPresentPath;
  #jwksClient;
  #policyName;
  #clientId;
  #azureIdentityDomain;
  #azureAuthService;
  #userRepository;

  constructor() {
    this.#excludedPaths = [
      EnvironmentService.APPLICATION_SWAGGER_PATH() || "/docs",
      "/swagger.json",
      "/swaggerui",
      "/"
    ];
    this.#optionalUserPresentPath = ["/users"];
    this.#policyName = EnvironmentService.AZURE_AD_B2C_POLICY_NAME();
    this.#clientId = EnvironmentService.AZURE_AD_B2C_CLIENT_ID();
    this.#azureIdentityDomain = EnvironmentService.AZURE_IDENTITY_DOMAIN();
    this.#azureAuthService = new AzureAuthService();
    this.#userRepository = getRepository(UserEntity);
  }

  #getKey(header, jwksUri) {
    this.#jwksClient = jwksClient({
      jwksUri,
    });
    return new Promise((resolve, reject) => {
      this.#jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          const signingKey = key.getPublicKey();
          resolve(signingKey);
        }
      });
    });
  }

  async #validateToken(token, issuerUrl, jwksUri) {
    try {
      const decodedHeader = jwt.decode(token, { complete: true }).header;
      const publicKey = await this.#getKey(decodedHeader, jwksUri);
      const decoded = jwt.verify(token, publicKey, {
        audience: this.#clientId,
        issuer: issuerUrl,
        algorithms: ["RS256"],
      });
      return decoded;
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw boom.unauthorized(StaticStrings.ERR_EXPIRED_TOKEN);
      } else {
        throw boom.unauthorized(StaticStrings.ERR_INVALID_TOKEN);
      }
    }
  }

  async use(request, h) {
    const authHeader = request.headers["authorization"];
    const currentPath = request.route.path;
      if (this.#excludedPaths.includes(currentPath)) {
        // Skip token validation and proceed with the request
        return h.continue;
      }


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw boom.unauthorized(StaticStrings.ERR_TOKEN_NOT_PROVIDED);
    }

    const token = authHeader.split(" ")[1];
    // Check if the current path is in the excluded paths

    try {
      const { issuerUrl, jwksUri } = await this.#azureAuthService.getData(
        `${this.#azureIdentityDomain}/${
          this.#policyName
        }/v2.0/.well-known/openid-configuration`
      );
      const jwtUserData = await this.#validateToken(token, issuerUrl, jwksUri);

      // Token is valid, proceed with the request
      const user = await this.#userRepository.findOneBy({
        UserIdentifier: jwtUserData.sub,
      });
      request["userId"] = user?.ID;

      if (this.#optionalUserPresentPath.includes(currentPath))
        return h.continue;

      if (!user) {
        throw boom.unauthorized(StaticStrings.ERR_INVALID_EMAIL);
      }
      return h.continue;
    } catch (error) {
      throw boom.unauthorized(error || StaticStrings.ERR_INVALID_EMAIL);
    }
  }
}

module.exports = { AzureAuthMiddleware };
