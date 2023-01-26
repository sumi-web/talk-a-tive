import express from 'express';
import { logInUser, me, createAccessToken, registerUser, logout, revokeUserAccess } from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginUserSchema, registerUserSchema, RevokeUserAccessSchema } from '../schema/user.schema';

const authRouter = express.Router();

authRouter.post('/signup', upload.single('image'), validate(registerUserSchema), registerUser);
authRouter.get('/me', isAuthenticated, me);
authRouter.post('/login', validate(loginUserSchema), logInUser);
authRouter.post('/refresh-token', createAccessToken);
authRouter.get('/logout', isAuthenticated, logout);
// Admin Routes
authRouter.get('/admin/user/revoke-token/:userId', validate(RevokeUserAccessSchema), revokeUserAccess);

export default authRouter;
