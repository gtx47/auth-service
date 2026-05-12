import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HasherPort } from '../../domain/ports/hasher.port';

@Injectable()
export class BcryptHasherService implements HasherPort {
  private readonly rounds = 10;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
