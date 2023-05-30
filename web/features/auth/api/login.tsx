import { axios } from '@/lib/axios';
import { UserResponse } from '../types';

export type LoginCredentials = {
  email: string;
  password: string;
};

export const loginWithEmailAndPassword = (data: LoginCredentials): Promise<UserResponse> => {
  return axios.post('/auth/login', data);
};
