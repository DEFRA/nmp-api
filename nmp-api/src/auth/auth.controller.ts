import { Controller, Get, Req } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@ApiSecurity('Bearer')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/login')
  @ApiOperation({ summary: 'Login using azure jwt token' })
  async login(@Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    return this.authService.login(token);
  }

  @Get('/refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Req() req: Request) {
    const token = req.headers['authorization'].split(' ')[1];
    return this.authService.refreshToken(token);
  }
}
