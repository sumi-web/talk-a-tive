import express from 'express';
import { registerUser } from '../controllers/user.controller';

const authRouter = express.Router();

authRouter.post('/signup', registerUser);

export default authRouter;
