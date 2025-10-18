import {Router} from 'express';
import {authWithGoogle, createReviewController, deleteUserController, forgotPassword, getAllRevController, getAllReviewController, getAllUserController, loginUserController, logOutController, refreshTokens, registerUserController, removeImageController, resetPassword, updateUserDetailsController, userAvatarController, userDetails, verifyEmailController, verifyOtp} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const userRouter=Router();
userRouter.post("/register",registerUserController);
userRouter.post("/verifyEmail",verifyEmailController);
userRouter.post("/login",loginUserController);
userRouter.post("/authWithGoogle",authWithGoogle); //register with google
//auth is middleware to check that user login or not 
userRouter.get("/logout",auth,logOutController); 
userRouter.put("/user-avatar",auth,upload.array("avatar"),userAvatarController);
userRouter.put("/deleteImage",auth,removeImageController);
userRouter.put("/:id",auth,updateUserDetailsController);
userRouter.post("/forgot-password",forgotPassword);
userRouter.post("/forgot-password-otp-verify",verifyOtp);
userRouter.post("/reset-password",resetPassword);
userRouter.post("/refreshToken",refreshTokens);
userRouter.get("/user-details",auth,userDetails);

//review routes
userRouter.post("/create-review",auth,createReviewController);
userRouter.get("/get-all-review",getAllReviewController);
userRouter.get("/get-all-users",getAllUserController);
userRouter.get("/get-all-rev",getAllRevController);
userRouter.delete("/delete/:id",auth,deleteUserController);

export default userRouter; 
     