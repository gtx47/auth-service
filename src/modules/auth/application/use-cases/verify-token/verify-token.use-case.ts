import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TOKEN_SERVICE } from '../../../auth.tokens';
import {
  TokenPayload,
  TokenServicePort,
} from '../../../domain/ports/token-service.port';

export interface VerifyTokenCommand {
  token: string;
}

@Injectable()
export class VerifyTokenUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  execute(command: VerifyTokenCommand): TokenPayload {
    const payload = this.tokenService.verify(command.token);
    if (!payload) {
      throw new UnauthorizedException('Token inválido');
    }
    return payload;
  }
}
