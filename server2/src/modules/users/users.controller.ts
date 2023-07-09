import { type NextFunction, type Request } from 'express';
import { type User } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import UserService from './users.service';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';

export default class UserController extends Api {
  private readonly userService = new UserService();

  public createUser = async (req: Request, res: CustomResponse<User>, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req.body);
      this.send(res, user, HttpStatusCode.Created, 'user created successfully');
    } catch (e) {
      next(e);
    }
  };
}
