import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import bcrypt from "bcryptjs";
import generateAccessTocken from "../utils/generateAccessTocken.js";
import generatedRefreshToken from "../utils/generateFreshToken.js";

//thsi for the email registeration or login 
export const registerUserController = async (request, response) => {
  try {
    let user;
    const { name, email, password } = request.body; //for register only name email and password
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            });
        }
        //check if the user already exist by checkin mail
         user = await userModel.findOne({ email });
        if(user){
            return response.json({
                message : "User already Registered with this email",
                error : true,
                success : false
            })
        }
        
        const verifyCode=Math.floor(100000+Math.random()*900000).toString(); //otp generate
       //for secure the password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new userModel({
            email: email,
            password: hashPassword,
            name: name,
            otp:verifyCode,
            otpExpires:Date.now()+5*60*1000, //form noww date to 10 min.
        });

        await user.save();

        // Send verification email
        await sendEmailFun(email,
    "Verify your email",
    "",
    `<p>Hello ${name}, your verification code is <b>${verifyCode}</b></p>`)

        //create a jwt token for verification code
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
            );

            response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! Please verify your email.",
            token: token // optional, if needed for verification
            });


  } catch (error) {
    return response.status(500).json({
      message: error.message||message,
      error: true,
      success: false,
    });
  }
};

//for verify email
export async function verifyEmailController(request, response) {
  try {
    const { email, otp } = request.body;

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return response.status(400).json({ success: false,error:true, message: "User not found" });

    }
    const isCodeValid= user.otp === otp;
    const isNotExpierd=user.otpExpires>Date.now();
    if (isCodeValid && isNotExpierd) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" });
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" });
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" });
        }

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

//login method
export async function loginUserController(request, response) {
  try{
    const {email, password}=request.body;
  const user=await userModel.findOne({email:email});
  //if user not found
  if(!email){
    return response.status(400).json({
      message:"user not register",
      error:true,
      success:false,
    })
  }
  //if login but not shown 
  if(user.status!=="Active"){
   return  response.status(400).json({
      message:"cotact to admin",
      error:true,
      success:false,
    })
  }
  //checking the password is true or not
  const checkPassword=await bcrypt.compare(password,user.password);
  if(!checkPassword){
    return response.status(400).json({
      message:"wrong password",
      error:true,
      success:false,
  })
}
 
const accesstoken=await generateAccessTocken(user._id);
const refreshToKen=await generatedRefreshToken(user._id);

const updateUser = await userModel.findByIdAndUpdate(user?._id, {
    last_login_date: new Date()
})

const cookiesOption = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
}

response.cookie('accessToken', accesstoken, cookiesOption)
response.cookie('refreshToken', refreshToKen, cookiesOption)
response.json({
  message: "login success",
  error:false,
  success:true,
  data:{
    accesstoken,
    refreshToKen
  }
  })
  }
  catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      error:true,
      success:false
    })
  }
}

//for logout
export async function logOutController(request, response) {
  try{
    const userid=request.userId
    const cookiesOption={
      httpOnly:true,
      secure:true,
      sameSite:"None"
    }
    response.clearCookie('accessToken', cookiesOption)
    response.clearCookie('refreshToken', cookiesOption)

    await userModel.findByIdAndUpdate(userid, {
      refreshToken: ""
    });

    return response.status(200).json({
      message: "Logged out successfully",
      error: false,
      success: true
    });
  }
  catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      error:true,
      success:false
    })
  }
}