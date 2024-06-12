import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '@interfaces/jwt-payload.interface';
import EnvironmentService from '@shared/environment.service';
import { AzureTokenValidationService } from '@shared/azure-token-validation-service';

@Injectable()
export class AuthService {
  private jwtRefreshTokenExpiry: string;

  constructor(
    protected jwtService: JwtService,
    protected readonly azureTokenValidationService: AzureTokenValidationService,
  ) {
    this.jwtRefreshTokenExpiry = EnvironmentService.JWT_REFRESH_TOKEN_EXPIRY();
  }

  public getTokens(payload: JwtPayload) {
    const accessToken: string = this.jwtService.sign(payload);
    const refreshToken: string = this.jwtService.sign(payload, {
      expiresIn: this.jwtRefreshTokenExpiry,
    });

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

  async login(token: string) {
    const { jwtUserData } =
      await this.azureTokenValidationService.validateAzureJwtToken(token);
    const payload: JwtPayload = this.getJwtPayload(jwtUserData);
    return this.getTokens(payload);
  }

  async refreshToken(payload: JwtPayload) {
    return this.getTokens(this.getJwtPayload(payload));
  }
}
