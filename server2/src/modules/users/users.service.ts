import { type User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { HttpStatusCode } from 'axios';
import { LogInUserDto } from '@/dto/user.dto';
import { passwordHash } from '@/utils/password-hash';

export default class UserService {
  public async createUser(data: User) {
    const alreadyUserExist = await prisma.user.findUnique({ where: { email: data.email } });

    if (alreadyUserExist) {
      throw new ApiError(HttpStatusCode.Forbidden, 'User already exist');
    }

    return await prisma.user.signUp(data);
  }

  public async logInUser(data: LogInUserDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      throw new ApiError(HttpStatusCode.NotFound, 'User does not found');
    }

    const success = await passwordHash.comparePassword(user.password, data.password);

    if (!success) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Password is incorrect');
    }

    //  return user with token
    const { password, ...rest } = user;

    return rest;
  }
}
