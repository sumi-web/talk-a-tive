import { type User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { HttpStatusCode } from 'axios';

export default class UserService {
  public async createUser(data: User) {
    const alreadyUserExist = await prisma.user.findUnique({ where: { email: data.email } });

    if (alreadyUserExist) {
      console.log('goes here', alreadyUserExist);
      throw new ApiError(HttpStatusCode.Forbidden, 'User already exist');
    }

    const user = await prisma.user.create({ data });
    return user;
  }
}
