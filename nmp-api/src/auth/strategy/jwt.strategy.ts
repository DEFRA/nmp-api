import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import EnvironmentService from '@shared/environment.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: EnvironmentService.JWT_SECRET(),
    });
  }

  async validate(payload: object) {
    return payload;
  }
}
