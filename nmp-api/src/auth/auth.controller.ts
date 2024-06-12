import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@guards/jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('/refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Req() req: Request) {
    const payload = req['jwtPayload'];
    return this.authService.refreshToken(payload);
  }
}
