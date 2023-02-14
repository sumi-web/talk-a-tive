import { getModelForClass, prop } from '@typegoose/typegoose';

export const ProviderName = {
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
  GITHUB: 'GITHUB',
  TWITTER: 'TWITTER',
  LINKEDIN: 'LINKEDIN',
} as const;

export type ProviderNameType = keyof typeof ProviderName;

export class ExternalProvider {
  @prop({ required: true, type: String, enum: ProviderName, minlength: 2, maxlength: 15 })
  public providerName!: ProviderNameType;

  @prop({ default: '' })
  providerToken!: string;

  @prop({ default: '' })
  wsEndPoint!: string; //web service end point
}

export const ExternalProviderModel = getModelForClass(ExternalProvider, { schemaOptions: { timestamps: true } });
