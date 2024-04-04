import { HttpException, HttpStatus } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export enum EnvironmentEnum {
  DEV,
  TEST,
  PROD,
}

export default class EnvironmentService {
  static getEnv(envName: string): string {
    const envValue = process.env[envName];
    if (envValue !== undefined) {
      return envValue;
    } else {
      throw new HttpException(
        `Environment variable ${envName} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  static DATABASE_HOST(): string {
    get: {
      return this.getEnv('DATABASE_HOST');
    }
  }

  static DATABASE_PORT(): number {
    get: {
      return parseInt(this.getEnv('DATABASE_PORT'));
    }
  }

  static DATABASE_NAME(): string {
    get: {
      return this.getEnv('DATABASE_NAME');
    }
  }

  static DATABASE_USER(): string {
    get: {
      return this.getEnv('DATABASE_USER');
    }
  }

  static DATABASE_PASSWORD(): string {
    get: {
      return this.getEnv('DATABASE_PASSWORD');
    }
  }

  static APPLICATION_VER(): string {
    get: {
      return this.getEnv('APPLICATION_VER');
    }
  }

  static APPLICATION_URL(): string {
    get: {
      return this.getEnv('APPLICATION_URL');
    }
  }

  static APPLICATION_PORT(): string {
    get: {
      return this.getEnv('APPLICATION_PORT');
    }
  }

  static APPLICATION_SWAGGER_PATH(): string {
    get: {
      return this.getEnv('APPLICATION_SWAGGER_PATH');
    }
  }

  static APPLICATION_ENV(): string {
    get: {
      if (!this.getEnv('APPLICATION_ENV')) {
        return process.env.NODE_ENV == 'production' ? 'PROD' : 'DEV';
      }
      return this.getEnv('APPLICATION_ENV');
    }
  }
}
