import { type User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { HttpStatusCode } from 'axios';
import { LogInUserDto } from '@/dto/user.dto';

export default class UserService {
  public async createUser(data: User) {
    const alreadyUserExist = await prisma.user.findUnique({ where: { email: data.email } });

    if (alreadyUserExist) {
      throw new ApiError(HttpStatusCode.Forbidden, 'User already exist');
    }

    const user = await prisma.user.create({ data });

    return user;
  }

  public async logInUser(data: LogInUserDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      throw new ApiError(HttpStatusCode.NotFound, 'User does not found');
    }

    console.log('user ==>', user);
  }
}
