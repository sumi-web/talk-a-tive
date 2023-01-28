import { DocumentType, getModelForClass, index, pre, prop, Ref } from '@typegoose/typegoose';
import argon2 from 'argon2';
import logger from '../utils/logger';
import { ExternalProvider } from './externalProvider.model';

export const AuthRoles = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type AuthRolesType = keyof typeof AuthRoles;

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

  @prop({ default: '' })
  public image!: string;

  @prop({ required: true, default: false })
  public isAdmin!: boolean;

  @prop({ required: true, type: String, enum: AuthRoles, default: AuthRoles.USER })
  public role!: AuthRolesType;

  @prop({ required: true, default: 0 })
  public tokenVersion!: number;

  @prop({ ref: () => ExternalProvider })
  public externalProvider?: Ref<ExternalProvider>;

  @prop()
  public passwordRecoveryToken?: string | undefined;

  @prop()
  public recoveryTokenTime?: string | undefined;

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
