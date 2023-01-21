import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';

export const revokeRefreshToken = async (userId: Types.ObjectId | string): Promise<boolean | null> => {
  return await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};
