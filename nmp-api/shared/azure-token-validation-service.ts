import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

import EnvironmentService from './environment.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { StaticStrings } from './static.string';
import { AzureAuthService } from '@shared/azure-auth-service';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from '@db/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AzureTokenValidationService {
  private jwksClient: any;
  private policyName: string;
  private clientId: string;
  private azureIdentityDomain: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    protected readonly azureAuthService: AzureAuthService,
  ) {
    this.policyName = EnvironmentService.AZURE_AD_B2C_POLICY_NAME();
    this.clientId = EnvironmentService.AZURE_AD_B2C_CLIENT_ID();
    this.azureIdentityDomain = EnvironmentService.AZURE_IDENTITY_DOMAIN();
  }

  getKey(header, jwksUri: string) {
    this.jwksClient = jwksClient({
      jwksUri,
    });
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          const signingKey = key.getPublicKey();
          resolve(signingKey);
        }
      });
    });
  }

  async validateToken(token: string, issuerUrl: string, jwksUri: string) {
    try {
      const decodedHeader = jwt.decode(token, { complete: true }).header;
      const publicKey: any = await this.getKey(decodedHeader, jwksUri);
      const decoded = jwt.verify(token, publicKey, {
        audience: this.clientId,
        issuer: issuerUrl,
        algorithms: ['RS256'],
      });
      return decoded;
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(StaticStrings.ERR_EXPIRED_TOKEN);
      } else {
        throw new UnauthorizedException(StaticStrings.ERR_INVALID_TOKEN);
      }
    }
  }

  async validateAzureJwtToken(token: string) {
    const { issuerUrl, jwksUri } = await this.azureAuthService.getData(
      `${this.azureIdentityDomain}/${this.policyName}/v2.0/.well-known/openid-configuration`,
    );
    const jwtUserData: any = await this.validateToken(
      token,
      issuerUrl,
      jwksUri,
    );

    const user = await this.userRepository.findOneBy({
      UserIdentifier: jwtUserData.sub,
    });
    if (!user) {
      throw new UnauthorizedException(StaticStrings.ERR_INVALID_EMAIL);
    }
    return { jwtUserData, user };
  }
}
