import {Router} from 'express';
import {loginUserController, logOutController, registerUserController, verifyEmailController} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';

const userRouter=Router();
userRouter.post("/register",registerUserController);
userRouter.post("/verifyEmail",verifyEmailController);
userRouter.post("/login",loginUserController);
//auth is middleware
userRouter.get("/logout",auth,logOutController); 

export default userRouter;
