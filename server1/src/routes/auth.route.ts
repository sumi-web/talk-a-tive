import express from 'express';
import { logInUser, me, refreshToken, registerUser } from '../controllers/auth.controller';
import { upload } from '../middleware/multer.middleware';

const authRouter = express.Router();

authRouter.post('/signup', upload.single('image'), registerUser);
authRouter.get('/me', me);
authRouter.post('/login', logInUser);
authRouter.post('/refresh', refreshToken);

export default authRouter;
