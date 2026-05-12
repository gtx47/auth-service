import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { USER_MODEL_NAME, UserDocument, UserMongo } from './user.schema';

@Injectable()
export class MongoUserRepository implements UserRepositoryPort {
  constructor(
    @InjectModel(USER_MODEL_NAME)
    private readonly userModel: Model<UserMongo>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async save(user: User): Promise<User> {
    const created = await this.userModel.create({
      name: user.name,
      email: user.email,
      password: user.passwordHash,
      role: user.role,
    });
    return this.toDomain(created);
  }

  async updateRole(email: string, role: UserRole): Promise<User> {
    const updated = await this.userModel
      .findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { $set: { role } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new Error('Usuario no encontrado');
    }
    return this.toDomain(updated);
  }

  private toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.password,
      role: doc.role,
    });
  }
}
