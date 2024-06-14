import UserEntity from '@db/entity/user.entity';
import { JwtPayload } from '@interfaces/jwt-payload.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { StaticStrings } from '@shared/static.string';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(StaticStrings.ERR_MISSING_TOKEN);
    }

    try {
      const user = await this.userRepository.findOneBy({
        RefreshToken: token,
      });
      if (!user) {
        throw new UnauthorizedException(StaticStrings.ERR_INVALID_RESET_TOKEN);
      }
      const payload: JwtPayload = this.jwtService.verify(
        user.EncryptedClaimsToken,
      );
      if (!payload) {
        throw new UnauthorizedException(StaticStrings.ERR_INVALID_TOKEN);
      }

      request['jwtPayload'] = payload;
      request['userId'] = user.ID;
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
