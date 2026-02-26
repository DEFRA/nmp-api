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
     {
      return this.getEnv("NODE_ENV");
    }
  }

  static AZURE_AD_CONNECTION_TYPE() {
     {
      return this.getEnv("AZURE_AD_CONNECTION_TYPE");
    }
  }

  static DATABASE_HOST() {
     {
      return this.getEnv("DATABASE_HOST");
    }
  }

  static DATABASE_PORT() {
     {
      return Number.parseInt(this.getEnv("DATABASE_PORT"));
    }
  }

  static DATABASE_NAME() {
     {
      if (process.env.NODE_ENV === "test")
        return this.getEnv("TEST_DATABASE_NAME");
      else return this.getEnv("DATABASE_NAME");
    }
  }

  static DATABASE_USER() {
     {
      return this.getEnv("DATABASE_USER");
    }
  }

  static DATABASE_PASSWORD() {
     {
      return this.getEnv("DATABASE_PASSWORD");
    }
  }

  static APPLICATION_VER() {
     {
      return this.getEnv("APPLICATION_VER");
    }
  }

  static APPLICATION_URL() {
     {
      return this.getEnv("APPLICATION_URL");
    }
  }

  static APPLICATION_PORT() {
     {
      return this.getEnv("APPLICATION_PORT");
    }
  }

  static APPLICATION_SWAGGER_PATH() {
     {
      return this.getEnv("APPLICATION_SWAGGER_PATH");
    }
  }

  static APPLICATION_API_KEY() {
     {
      return this.getEnv("APPLICATION_API_KEY");
    }
  }

  static RB209_BASE_URL() {
     {
      return this.getEnv("RB209_BASE_URL");
    }
  }

  static RB209_USER_EMAIL() {
     {
      return this.getEnv("RB209_USER_EMAIL");
    }
  }

  static RB209_USER_PASSWORD() {
     {
      return this.getEnv("RB209_USER_PASSWORD");
    }
  }

  static ADDR_LOOKUP_BASE_URL() {
    //ADDR_LOOKUP
     {
      return this.getEnv("ADDR_LOOKUP_BASE_URL");
    }
  }

  static ADDR_LOOKUP_SUBSCRIPTION_KEY() {
     {
      return this.getEnv("ADDR_LOOKUP_SUBSCRIPTION_KEY");
    }
  }

  static ADDR_SCOPE() {
     {
      return this.getEnv("ADDR_SCOPE");
    }
  }

  static ADDR_CLIENT_ID() {
     {
      return this.getEnv("ADDR_CLIENT_ID");
    }
  }

  static ADDR_CLIENT_SECRET() {
     {
      return this.getEnv("ADDR_CLIENT_SECRET");
    }
  }

  static ADDR_TENANT_ID() {
     {
      return this.getEnv("ADDR_TENANT_ID");
    }
  }
  static MANNER_BASE_URL() {
     {
      return this.getEnv("MANNER_BASE_URL");
    }
  }

  static APPLICATION_ENV() {
     {
      //if (!this.getEnv("APPLICATION_ENV")) {
      //  return process.env.NODE_ENV == "production" ? "PRODUCTION" : "DEVELOPMENT";
      //}
      return this.getEnv("APPLICATION_ENV");
    }
  }

  static AZURE_AD_B2C_TENANT_NAME() {
     {
      return this.getEnv("AZURE_AD_B2C_TENANT_NAME");
    }
  }

  static AZURE_AD_B2C_POLICY_NAME() {
     {
      return this.getEnv("AZURE_AD_B2C_POLICY_NAME");
    }
  }

  static AZURE_AD_B2C_CLIENT_ID() {
     {
      return this.getEnv("AZURE_AD_B2C_CLIENT_ID");
    }
  }

  static AZURE_IDENTITY_INSTANCE() {
     {
      return this.getEnv("AZURE_IDENTITY_INSTANCE");
    }
  }

  static azureIdentityMetadataUrl() {
     {
      return this.getEnv("AZURE_IDENTITY_METADATA_URL");
    }
  }
  

  static AZURE_IDENTITY_DOMAIN() {
     {
      return this.getEnv("AZURE_IDENTITY_DOMAIN");
    }
  }
}

module.exports = EnvironmentService;

