import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../domain/entities/user.entity';

export type UserDocument = HydratedDocument<UserMongo>;

@Schema({ collection: 'users' })
export class UserMongo {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ type: String, required: true })
  password!: string;

  @Prop({ type: String, enum: ['customer', 'admin'], default: 'customer' })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(UserMongo);
export const USER_MODEL_NAME = 'User';
