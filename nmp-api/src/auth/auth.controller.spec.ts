import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtPayload, token } from '../../test/mocked-data';
import { JwtModule } from '@nestjs/jwt';
import { AzureTokenValidationService } from '@shared/azure-token-validation-service';
import { AzureAuthService } from '@shared/azure-auth-service';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import UserEntity from '@db/entity/user.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        JwtModule.register({
          secret: 'my-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([UserEntity]),
      ],
      controllers: [AuthController],
      providers: [AuthService, AzureTokenValidationService, AzureAuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe.skip('login', () => {
    it('should return the accessToken and refreshToken in responnse', async () => {
      const req = { headers: { authorization: token } } as any;

      const result = await controller.login(req);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('Refresh Token', () => {
    it('should return the accessToken and refreshToken in responnse', async () => {
      const req = { jwtPayload } as any;

      const result = await controller.refreshToken(req);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
