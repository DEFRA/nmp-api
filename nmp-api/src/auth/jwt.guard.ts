import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Invalid token!');
    }

    try {
      // const payload = await this.jwtService.verifyAsync(token, {
      //   secret: 'your_secret_key',
      // });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      //request['user'] = payload;

      const decodedToken: any = this.jwtService.decode(token);
      console.log(JSON.stringify(decodedToken));
      if (
        !decodedToken ||
        !decodedToken.aud ||
        decodedToken.aud !== '00000003-0000-0000-c000-000000000000'
      ) {
        throw new Error('Invalid token audience');
      }

      if (
        !decodedToken ||
        !decodedToken.exp ||
        Date.now() >= decodedToken.exp * 1000
      ) {
        throw new Error('Token has expired');
      }

      if (
        !decodedToken ||
        !decodedToken.iss ||
        decodedToken.iss !==
          'https://sts.windows.net/7f1dc9a9-4112-4ab6-9871-834ecb1d13e2/'
      ) {
        throw new Error('Invalid token issuer');
      }

      // Token is valid
      console.log('Token is valid');
      return decodedToken;
    } catch (error) {
      throw error; //new UnauthorizedException(HttpStatus.UNAUTHORIZED, error.message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Observable } from 'rxjs';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     return request.isAuthenticated();
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuardMy extends AuthGuard('jwt') {}
