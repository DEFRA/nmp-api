require("dotenv").config();

class EnvironmentService {
  static getEnv(envName) {
    const envValue = process.env[envName];
    if (envValue !== undefined) {
      return envValue;
    } else {
      console.warn(`Environment variable ${envName} does not exist`);
    }
  }

  static NODE_ENV() {
    get: {
      return this.getEnv("NODE_ENV");
    }
  }

  static AZURE_AD_CONNECTION_TYPE() {
    get: {
      return this.getEnv("AZURE_AD_CONNECTION_TYPE");
    }
  }

  static DATABASE_HOST() {
    get: {
      return this.getEnv("DATABASE_HOST");
    }
  }

  static DATABASE_PORT() {
    get: {
      return parseInt(this.getEnv("DATABASE_PORT"));
    }
  }

  static DATABASE_NAME() {
    get: {
      if (process.env.NODE_ENV === "test")
        return this.getEnv("TEST_DATABASE_NAME");
      else return this.getEnv("DATABASE_NAME");
    }
  }

  static DATABASE_USER() {
    get: {
      return this.getEnv("DATABASE_USER");
    }
  }

  static DATABASE_PASSWORD() {
    get: {
      return this.getEnv("DATABASE_PASSWORD");
    }
  }

  static APPLICATION_VER() {
    get: {
      return this.getEnv("APPLICATION_VER");
    }
  }

  static APPLICATION_URL() {
    get: {
      return this.getEnv("APPLICATION_URL");
    }
  }

  static APPLICATION_PORT() {
    get: {
      return this.getEnv("APPLICATION_PORT");
    }
  }

  static APPLICATION_SWAGGER_PATH() {
    get: {
      return this.getEnv("APPLICATION_SWAGGER_PATH");
    }
  }

  static APPLICATION_API_KEY() {
    get: {
      return this.getEnv("APPLICATION_API_KEY");
    }
  }

  static RB209_BASE_URL() {
    get: {
      return this.getEnv("RB209_BASE_URL");
    }
  }

  static RB209_USER_EMAIL() {
    get: {
      return this.getEnv("RB209_USER_EMAIL");
    }
  }

  static RB209_USER_PASSWORD() {
    get: {
      return this.getEnv("RB209_USER_PASSWORD");
    }
  }

  static ADDR_LOOKUP_BASE_URL() {
    //ADDR_LOOKUP
    get: {
      return this.getEnv("ADDR_LOOKUP_BASE_URL");
    }
  }

  static ADDR_LOOKUP_SUBSCRIPTION_KEY() {
    get: {
      return this.getEnv("ADDR_LOOKUP_SUBSCRIPTION_KEY");
    }
  }

  static ADDR_SCOPE() {
    get: {
      return this.getEnv("ADDR_SCOPE");
    }
  }

  static ADDR_CLIENT_ID() {
    get: {
      return this.getEnv("ADDR_CLIENT_ID");
    }
  }

  static ADDR_CLIENT_SECRET() {
    get: {
      return this.getEnv("ADDR_CLIENT_SECRET");
    }
  }

  static ADDR_TENANT_ID() {
    get: {
      return this.getEnv("ADDR_TENANT_ID");
    }
  }
  static MANNER_BASE_URL() {
    get: {
      return this.getEnv("MANNER_BASE_URL");
    }
  }

  static APPLICATION_ENV() {
    get: {
      //if (!this.getEnv("APPLICATION_ENV")) {
      //  return process.env.NODE_ENV == "production" ? "PRODUCTION" : "DEVELOPMENT";
      //}
      return this.getEnv("APPLICATION_ENV");
    }
  }

  static AZURE_AD_B2C_TENANT_NAME() {
    get: {
      return this.getEnv("AZURE_AD_B2C_TENANT_NAME");
    }
  }

  static AZURE_AD_B2C_POLICY_NAME() {
    get: {
      return this.getEnv("AZURE_AD_B2C_POLICY_NAME");
    }
  }

  static AZURE_AD_B2C_CLIENT_ID() {
    get: {
      return this.getEnv("AZURE_AD_B2C_CLIENT_ID");
    }
  }

  static AZURE_IDENTITY_INSTANCE() {
    get: {
      return this.getEnv("AZURE_IDENTITY_INSTANCE");
    }
  }

  static AZURE_IDENTITY_DOMAIN() {
    get: {
      return this.getEnv("AZURE_IDENTITY_DOMAIN");
    }
  }
}

module.exports = EnvironmentService;

