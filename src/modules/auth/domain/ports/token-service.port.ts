import { UserRole } from '../entities/user.entity';

export interface TokenPayload {
  id: string | null;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenServicePort {
  generate(payload: { id: string | null; email: string; role: UserRole }): string;
  verify(token: string): TokenPayload | null;
}
