import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { StaticStrings } from 'shared/static.string';
import { AzureTokenValidationService } from '@shared/azure-token-validation-service';

@Injectable()
export class AzureAuthMiddleware implements NestMiddleware {
  private excludedPaths: string[];
  private optionalUserPresentPath: string[];

  constructor(
    private readonly azureTokenValidationService: AzureTokenValidationService,
  ) {
    this.excludedPaths = ['*', '/health', '/auth/login', '/auth/refresh-token'];
    this.optionalUserPresentPath = ['/users'];
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const currentPath = req.baseUrl;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(StaticStrings.ERR_TOKEN_NOT_PROVIDED);
    }

    // Check if the current path is in the excluded paths
    if (this.excludedPaths.includes(currentPath)) {
      // Skip token validation and proceed with the request
      next();
      return;
    }
    const token = authHeader.split(' ')[1];

    try {
      const { user } =
        await this.azureTokenValidationService.validateAzureJwtToken(token);
      // Token is valid, proceed with the request

      if (this.optionalUserPresentPath.includes(currentPath)) {
        next();
        return;
      }
      req['userId'] = user.ID;
      next();
    } catch (e) {
      throw new UnauthorizedException(
        e?.message || StaticStrings.ERR_INVALID_TOKEN,
      );
    }
  }
}
