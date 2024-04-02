import { DefaultAzureCredential, TokenCredential } from '@azure/identity';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { StaticStrings } from 'shared/static.string';

@Injectable()
export class AzureAuthMiddleware implements NestMiddleware {
  private excludedPaths: string[];
  private credential: TokenCredential;

  constructor() {
    this.credential = new DefaultAzureCredential();
    this.excludedPaths = ['*', '/health'];
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const currentPath = req.path;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token not provided');
    }

    const token = authHeader.split(' ')[1];
    // Check if the current path is in the excluded paths
    if (this.excludedPaths.includes(currentPath)) {
      // Skip token validation and proceed with the request
      next();
      return;
    }

    try {
      await this.credential.getToken('https://graph.microsoft.com/.default');
      // Token is valid, proceed with the request
      console.log('Token is valid, proceed with the request');
      next();
    } catch (error) {
      throw new UnauthorizedException(StaticStrings.ERR_INVALID_TOKEN);
    }
  }
}
