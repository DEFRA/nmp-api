import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtPayload } from '@interfaces/jwt-payload.interface';
import EnvironmentService from '@shared/environment.service';
import { AzureTokenValidationService } from '@shared/azure-token-validation-service';
import UserEntity from '@db/entity/user.entity';

@Injectable()
export class AuthService {
  private jwtRefreshTokenExpiry: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    protected jwtService: JwtService,
    protected readonly azureTokenValidationService: AzureTokenValidationService,
  ) {
    this.jwtRefreshTokenExpiry = EnvironmentService.JWT_REFRESH_TOKEN_EXPIRY();
  }

  public getTokens(payload: JwtPayload) {
    const accessToken: string = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(20).toString('hex');

    return {
      accessToken,
      refreshToken,
    };
  }

  private getJwtPayload(jwtData) {
    return {
      iss: jwtData.iss,
      sub: jwtData.sub,
      aud: jwtData.aud,
      acr: jwtData.acr,
      nonce: jwtData.nonce,
      aal: jwtData.aal,
      serviceId: jwtData.serviceId,
      correlationId: jwtData.correlationId,
      currentRelationshipId: jwtData.currentRelationshipId,
      sessionId: jwtData.sessionId,
      email: jwtData.email,
      contactId: jwtData.contactId,
      firstName: jwtData.firstName,
      lastName: jwtData.lastName,
      uniqueReference: jwtData.uniqueReference,
      relationships: jwtData.relationships,
      roles: jwtData.roles,
    };
  }

  async updateUserClaimsData(
    refreshToken: string,
    accessToken: string,
    userId: number,
  ) {
    const jwtExpiryTime = new Date();
    jwtExpiryTime.setDate(
      jwtExpiryTime.getDate() + parseInt(this.jwtRefreshTokenExpiry),
    );

    await this.userRepository.update(
      { ID: userId },
      {
        RefreshToken: refreshToken,
        EncryptedClaimsToken: accessToken,
        RefreshTokenExpiresOn: jwtExpiryTime,
      },
    );
  }

  async login(token: string) {
    const { jwtUserData, user } =
      await this.azureTokenValidationService.validateAzureJwtToken(token);
    const payload: JwtPayload = this.getJwtPayload(jwtUserData);
    const { accessToken, refreshToken } = this.getTokens(payload);
    await this.updateUserClaimsData(refreshToken, accessToken, user.ID);
    return { accessToken, refreshToken };
  }

  async refreshToken(payload: JwtPayload, userId: number) {
    const { accessToken, refreshToken } = this.getTokens(
      this.getJwtPayload(payload),
    );
    await this.updateUserClaimsData(refreshToken, accessToken, userId);
    return { accessToken, refreshToken };
  }
}
