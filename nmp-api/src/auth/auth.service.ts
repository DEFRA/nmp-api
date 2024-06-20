import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtPayload } from '@interfaces/jwt-payload.interface';
import EnvironmentService from '@shared/environment.service';
import { AzureTokenValidationService } from '@shared/azure-token-validation-service';
import UserEntity from '@db/entity/user.entity';
import { StaticStrings } from '@shared/static.string';
import dayjs from 'dayjs';

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

  private getJwtPayload(jwtData, userId: number) {
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
      userId,
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
    const payload: JwtPayload = this.getJwtPayload(jwtUserData, user.ID);
    const { accessToken, refreshToken } = this.getTokens(payload);
    await this.updateUserClaimsData(refreshToken, accessToken, user.ID);
    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string) {
    const user = await this.userRepository.findOneBy({
      RefreshToken: token,
    });
    if (!user) {
      throw new UnauthorizedException(StaticStrings.ERR_INVALID_RESET_TOKEN);
    }

    if (dayjs(new Date()).isAfter(dayjs(user.RefreshTokenExpiresOn))) {
      throw new UnauthorizedException(StaticStrings.ERR_EXPIRED_TOKEN);
    }
    const payload: JwtPayload = this.jwtService.verify(
      user.EncryptedClaimsToken,
    );
    if (!payload) {
      throw new UnauthorizedException(StaticStrings.ERR_INVALID_TOKEN);
    }

    return {
      payload,
      userId: user.ID,
    };
  }

  async refreshToken(token: string) {
    const { payload, userId } = await this.verifyRefreshToken(token);
    const { accessToken, refreshToken } = this.getTokens(
      this.getJwtPayload(payload, userId),
    );
    await this.updateUserClaimsData(refreshToken, accessToken, userId);
    return { accessToken, refreshToken };
  }
}
