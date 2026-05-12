import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginUserUseCase } from './application/use-cases/login-user/login-user.use-case';
import { PromoteUserUseCase } from './application/use-cases/promote-user/promote-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user/register-user.use-case';
import { VerifyTokenUseCase } from './application/use-cases/verify-token/verify-token.use-case';
import {
  ADMIN_PROMOTE_SECRET,
  HASHER,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from './auth.tokens';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { USER_MODEL_NAME, UserSchema } from './infrastructure/persistence/user.schema';
import { BcryptHasherService } from './infrastructure/services/bcrypt-hasher.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { AuthController } from './interfaces/http/auth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL_NAME, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyTokenUseCase,
    PromoteUserUseCase,
    { provide: USER_REPOSITORY, useClass: MongoUserRepository },
    { provide: HASHER, useClass: BcryptHasherService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    {
      provide: ADMIN_PROMOTE_SECRET,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        cfg.getOrThrow<string>('ADMIN_PROMOTE_SECRET'),
    },
  ],
})
export class AuthModule {}
