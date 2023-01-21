import express from 'express';
import { logInUser, me, createAccessToken, registerUser, logout, revokeUserAccess } from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';

const authRouter = express.Router();

authRouter.post('/signup', upload.single('image'), registerUser);
authRouter.get('/me', isAuthenticated, me);
authRouter.post('/login', logInUser);
authRouter.post('/refresh-token', createAccessToken);
authRouter.get('/logout', isAuthenticated, logout);
// Admin Routes
authRouter.get('/admin/user/revoke-token/:userId', revokeUserAccess);

export default authRouter;
