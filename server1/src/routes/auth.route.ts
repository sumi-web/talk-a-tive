import express from 'express';
import { registerUser } from '../controllers/user.controller';
import { upload } from '../middleware/multer.middleware';

const authRouter = express.Router();

authRouter.post('/signup', upload.single('image'), registerUser);

export default authRouter;
