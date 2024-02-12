import { type Request } from 'express';
import { type User } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import UserService from './users.service';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';
import { asyncHandler } from '@/middlewares/async-handler';
import exclude from '@/utils/exclude';
import jwtTokens from '@/lib/jwt-tokens';

export default class UserController extends Api {
  private readonly userService = new UserService();

  public createUser = asyncHandler(async (req: Request, res: CustomResponse<User>) => {
    const user = await this.userService.createUser(req.body);

    const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);

    const tokens = await jwtTokens.generateAuthTokens(user.id);

    this.send(res, { user: userWithoutPassword, tokens }, HttpStatusCode.Created, 'User created successfully');
  });

  public logInUser = asyncHandler(async (req: Request, res: CustomResponse<User>) => {
    const user = await this.userService.logInUser(req.body);

    this.send(res, user, HttpStatusCode.Ok, 'User logged in successfully');
  });
}
