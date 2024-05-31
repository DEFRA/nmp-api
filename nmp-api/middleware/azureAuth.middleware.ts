import UserEntity from '@db/entity/user.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import EnvironmentService from '@shared/environment.service';
import { NextFunction, Request, Response } from 'express';
import { StaticStrings } from 'shared/static.string';
import { Repository } from 'typeorm';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AzureAuthMiddleware implements NestMiddleware {
  private excludedPaths: string[];
  private jwksClient: any;
  private tenantName: string;
  private policyName: string;
  private clientId: string;
  private issuerUrl: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    this.excludedPaths = ['*', '/health'];
    this.tenantName = EnvironmentService.AZURE_AD_B2C_TENANT_NAME();
    this.policyName = EnvironmentService.AZURE_AD_B2C_POLICY_NAME();
    this.clientId = EnvironmentService.AZURE_AD_B2C_CLIENT_ID();
    this.issuerUrl = EnvironmentService.AZURE_AD_B2C_ISSUER_URL();
    this.jwksClient = jwksClient({
      jwksUri: `https://${this.tenantName}.b2clogin.com/${this.tenantName}.onmicrosoft.com/${this.policyName}/discovery/v2.0/keys`,
    });
  }

  getKey(header) {
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

  async validateToken(token) {
    try {
      const decodedHeader = jwt.decode(token, { complete: true }).header;
      const publicKey: any = await this.getKey(decodedHeader);
      const decoded = jwt.verify(token, publicKey, {
        audience: this.clientId,
        issuer: this.issuerUrl,
        algorithms: ['RS256'],
      });
      return decoded;
    } catch (e) {
      throw new HttpException(e?.message, HttpStatus.UNAUTHORIZED);
    }
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
      const jwtUserData: any = await this.validateToken(token);
      // Token is valid, proceed with the request

      const user = await this.userRepository.findOneBy({
        UserIdentifier: jwtUserData.currentRelationshipId,
      });
      if (!user) {
        console.log('No user found');
        throw new HttpException('No user found', HttpStatus.UNAUTHORIZED);
      }
      console.log('Token is valid, proceed with the request');
      req['userId'] = user.ID;
      next();
    } catch (e) {
      throw new UnauthorizedException(
        e?.message || StaticStrings.ERR_INVALID_TOKEN,
      );
    }
  }
}
