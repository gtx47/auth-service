import { User, UserRole } from '../entities/user.entity';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  updateRole(email: string, role: UserRole): Promise<User>;
}
