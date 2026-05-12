export type UserRole = 'customer' | 'admin';

export interface UserProps {
  id?: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface PublicUser {
  id: string | null;
  name: string;
  email: string;
  role: UserRole;
}

export class User {
  public readonly id: string | null;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;

  constructor(props: UserProps) {
    const { id, name, email, passwordHash, role = 'customer' } = props;

    if (!name || name.trim().length < 2) {
      throw new Error('Nombre inválido');
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Email inválido');
    }
    if (!passwordHash) {
      throw new Error('Password hash requerido');
    }
    if (!['customer', 'admin'].includes(role)) {
      throw new Error('Rol inválido');
    }

    this.id = id ?? null;
    this.name = name.trim();
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.role = role;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  toPublicJSON(): PublicUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
    };
  }
}
