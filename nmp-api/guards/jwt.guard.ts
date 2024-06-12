import { JwtPayload } from '@interfaces/jwt-payload.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StaticStrings } from '@shared/static.string';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(StaticStrings.ERR_MISSING_TOKEN);
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token);
      if (!payload) {
        throw new UnauthorizedException(StaticStrings.ERR_INVALID_TOKEN);
      }

      request['jwtPayload'] = payload;

      return true;
    } catch (e) {
      throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, e?.message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
