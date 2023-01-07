import mongoose from 'mongoose';
import { Environment } from './environment';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', false);
  mongoose.connect(Environment.mongoUrl);
};
