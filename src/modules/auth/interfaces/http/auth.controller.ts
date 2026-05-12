import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserUseCase } from '../../application/use-cases/login-user/login-user.use-case';
import { PromoteUserUseCase } from '../../application/use-cases/promote-user/promote-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { VerifyTokenUseCase } from '../../application/use-cases/verify-token/verify-token.use-case';
import { LoginUserDto } from './dtos/login-user.dto';
import { PromoteUserDto } from './dtos/promote-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { VerifyTokenDto } from './dtos/verify-token.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly verifyToken: VerifyTokenUseCase,
    private readonly promoteUser: PromoteUserUseCase,
  ) {}

  @Get('health')
  health() {
    return { ok: true, service: 'auth' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto) {
    return this.loginUser.execute(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: VerifyTokenDto) {
    try {
      const payload = this.verifyToken.execute(dto);
      return { valid: true, payload };
    } catch {
      throw new UnauthorizedException({ valid: false });
    }
  }

  @Post('promote')
  @HttpCode(HttpStatus.OK)
  async promote(@Body() dto: PromoteUserDto) {
    return this.promoteUser.execute(dto);
  }
}
