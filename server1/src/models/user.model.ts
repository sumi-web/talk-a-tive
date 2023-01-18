import { DocumentType, getModelForClass, index, pre, prop } from '@typegoose/typegoose';
import argon2 from 'argon2';
import { logger } from '../utils/logger';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@pre<User>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await argon2.hash(this.password);
})
@index({ email: 1 }, { unique: true })
export class User {
  @prop({ required: true, minlength: 2, maxlength: 20 })
  public name!: string;

  @prop({ required: true, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'], maxlength: 20 })
  public email!: string;

  @prop({ required: true, minlength: 6, maxlength: 20, select: false })
  public password!: string;

  @prop({ required: true })
  public image!: string;

  @prop({ required: true, default: false })
  public isAdmin!: boolean;

  @prop({ required: true, type: String, enum: UserRole, default: UserRole.USER })
  public role!: UserRole;

  public async comparePassword(this: DocumentType<User>, password: string) {
    try {
      return await argon2.verify(this.password, password);
    } catch (err: any) {
      logger.error(err);
      throw new Error(err);
    }
  }
}

export const UserModel = getModelForClass(User, { schemaOptions: { timestamps: true, versionKey: false } });
