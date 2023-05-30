import express from 'express';
import {
  logInUser,
  me,
  createAccessToken,
  registerUser,
  logout,
  revokeUserAccess,
  googleOAuthHandler,
  facebookOAuthHandler,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { upload } from '../middleware/multer.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginUserSchema, registerUserSchema, RevokeUserAccessSchema } from '../schema/user.schema';

const authRouter = express.Router();

/**
 * @openapi
 * /api/v1/auth/signup:
 *  post:
 *    tags:
 *    - Auth
 *    summary: Register a user
 *    requestBody:
 *      required: true
 *      contents:
 *        multipart/form-data:
 *          schema:
 *             type: object
 *             properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              image:
 *                type: string
 *                format: binary
 *          encoding: # The same level as schema
 *            profileImage: # Property name (see above)
 *              contentType: image/png, image/jpeg
 *    responses:
 *      201:
 *        description: Success
 *        content:  # Response body
 *           application/json:  # Media type
 *             schema:          # Must-have
 *               type: object   # Data type
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 image:       # Sample data
 *                   type: string
 *                 accessToken:
 *                   type: string
 */
authRouter.post('/signup', upload.single('image'), validate(registerUserSchema), registerUser);
authRouter.get('/me', isAuthenticated, me);
authRouter.post('/login', validate(loginUserSchema), logInUser);
authRouter.post('/refresh-token', createAccessToken);
authRouter.get('/logout', isAuthenticated, logout);
// oauth redirects url
authRouter.get('/oauth/google', googleOAuthHandler);
authRouter.get('/oauth/facebook', facebookOAuthHandler);

// Admin Routes
authRouter.get('/admin/user/revoke-token/:userId', validate(RevokeUserAccessSchema), revokeUserAccess);

export default authRouter;
