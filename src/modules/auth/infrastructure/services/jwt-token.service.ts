import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../domain/entities/user.entity';
import {
  TokenPayload,
  TokenServicePort,
} from '../../domain/ports/token-service.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: { id: string | null; email: string; role: UserRole }): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      return null;
    }
  }
}
