import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AzureTokenValidationService } from '@shared/azure-token-validation-service';
import { AzureAuthService } from '@shared/azure-auth-service';
import UserEntity from '@db/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, AzureTokenValidationService, AzureAuthService],
})
export class AuthModule {}
