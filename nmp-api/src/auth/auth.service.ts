import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import EnvironmentService from '@shared/environment.service';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async signin(apiKey: string) {
    const API_KEY = EnvironmentService.APPLICATION_API_KEY();
    if (apiKey !== API_KEY)
      throw new ForbiddenException('Credentials Incorrect');

    return this.signToken();
  }

  async signToken() {
    const payload = {};
    const secret = EnvironmentService.JWT_SECRET();

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret,
    });

    return { accessToken: token };
  }
}
