import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import bcrypt from "bcryptjs";
import generateAccessTocken from "../utils/generateAccessTocken.js";
import generatedRefreshToken from "../utils/generateFreshToken.js";
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';
import { VerificationEmail } from "../utils/verifyEmailTemplate.js";
import { error } from "console";
import reviewModel from "../models/review.model.js";

cloudinary.config({ 
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});
var imagesArr = [];

//thsi for the email registeration  
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
    if (user) {
      return response.json({
        message: "User already Registered with this email",
        error: true,
        success: false
      })
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); //otp generate
    //for secure the password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user = new userModel({
      email: email,
      password: hashPassword,
      name: name,
      otp: verifyCode,
      otpExpires: Date.now() + 5 * 60 * 1000, //form noww date to 10 min.
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
      message: error.message || message,
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
      return response.status(400).json({ success: false, error: true, message: "User not found" });

    }
    const isCodeValid = user.otp === otp;
    const isNotExpierd = user.otpExpires > Date.now();
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

//google register
export async function authWithGoogle(request, response) {
  const { name, email, password, avatar, mobile,role ,signUpWithGoogle} = request.body;
  try {
    const existUser = await userModel.findOne({ email: email }); //to checking that they are present are not
    if (!existUser) { //if user not founde then create  user model
      const user = await userModel.create({
        name: name,
        mobile: mobile,
        email: email,
        password: password,
        avatar: avatar,
        verify_email: true,
        role:role,
        signUpWithGoogle:signUpWithGoogle
      })
      //for save
      await user.save();
      const accesstoken = await generateAccessTocken(user._id);
      const refreshToKen = await generatedRefreshToken(user._id);

      const updateUser = await userModel.findByIdAndUpdate(user?._id, {
        last_login_date: new Date()
      })

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
      }

      response.cookie('accesstoken', accesstoken, cookiesOption)
      response.cookie('refreshToken', refreshToKen, cookiesOption)
      response.json({
        message: "login success",
        error: false,
        success: true,
        data: {
          accesstoken,
          refreshToKen
        }
      })
    }
    else{ //if already present user
      const accesstoken = await generateAccessTocken(existUser._id);
      const refreshToKen = await generatedRefreshToken(existUser._id);

      const updateUser = await userModel.findByIdAndUpdate(existUser?._id, {
        last_login_date: new Date()
      })

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
      }

      response.cookie('accesstoken', accesstoken, cookiesOption)
      response.cookie('refreshToken', refreshToKen, cookiesOption)
      response.json({
        message: "login success",
        error: false,
        success: true,
        data: {
          accesstoken,
          refreshToKen
        }
      })
    }
  }
   catch (error) {
  return response.status(500).json({
    message: error.message || error,
    error: true,
  });
}
}

//login method
export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;
    const user = await userModel.findOne({ email: email });
    //if user not found
    if (!email) {
      return response.status(400).json({
        message: "user not register",
        error: true,
        success: false,
      })
    }
    //if login but not shown 
    if (user.status !== "Active") {
      return response.status(400).json({
        message: "cotact to admin",
        error: true,
        success: false,
      })
    }
    //if email not verifted
    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "your email is not verified yet",
        error: true,
        success: false,
      })
    }
    //checking the password is true or not
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "wrong password",
        error: true,
        success: false,
      })
    }

    const accesstoken = await generateAccessTocken(user._id);
    const refreshToKen = await generatedRefreshToken(user._id);

    const updateUser = await userModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date()
    })

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }

    response.cookie('accesstoken', accesstoken, cookiesOption)
    response.cookie('refreshToken', refreshToKen, cookiesOption)
    response.json({
      message: "login success",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToKen
      }
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}

//for logout
export async function logOutController(request, response) {
  try {
    const userid = request.userId  //from middleware auth.js
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }
    response.clearCookie('access_token', cookiesOption)
    response.clearCookie('refresh_token', cookiesOption)

    await userModel.findByIdAndUpdate(userid, {
      refreshToken: ""
    });

    return response.status(200).json({
      message: "Logged out successfully",
      error: false,
      success: true
    });
  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}

//user avatoar contoller profile photo so we go on cloudanary where we upload all images
// export async function userAvatarController(request,response) {
//   try{


//     const userId = request.userId;
//     const image=request.files;
//     for (let i = 0; i < image?.length; i++) { //? is chaning method to optional check one by one if true then next if null then return undefined
//       const options = {
//         use_filename: true,
//         unique_filename: false,
//         overwrite: false,
//       };
//       //upload
//       await cloudinary.uploader.upload(
//         image[i].path,
//         options,
//         function (error, result) {
//           if (result) {
//             imagesArr.push(result.secure_url);
//             fs.unlinkSync(`uploads/${request.files[i].filename}`); //Deletes a file synchronously from your local file system  Path to the locally saved file.
//             console.log(request.files[i].filename);//uploads folder first load onit and then delete automatic
//           }
//         }
//       );
//     }


//     return response.status(200).json({
//       _id: userId, //userId from auth middleware
//       avatar: imagesArr[0],
//     });
//   }
//   catch(error){
//     return response.status(500).json({
//       message: "Internal Server Error",
//       error:true,
//       success:false
//   })
// }
// }
//update all image and delete old image
export async function userAvatarController(request, response) {
  try {
    const userId = request.userId;

    // Find user from DB to check old avatar
    const user = await userModel.findById(userId);
    if (!user) {
      return response.status(404).json({ message: "User not found", success: false });
    }

    // Delete previous avatar from Cloudinary if exists
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0]; // Extract public_id
      await cloudinary.uploader.destroy(publicId);
    }

    const imagesArr = [];
    const files = request.files;

    // Upload new avatar(s) to Cloudinary
    for (let i = 0; i < files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };

      const result = await cloudinary.uploader.upload(files[i].path, options);

      if (result) {
        imagesArr.push(result.secure_url);
        fs.unlinkSync(`uploads/${files[i].filename}`); // Delete from local uploads
      }
    }

    // Update DB with new avatar (first uploaded image)
    user.avatar = imagesArr[0];
    await user.save();

    return response.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
      success: true,
    });

  } catch (error) {
    console.error("Avatar Update Error:", error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
// export async function userAvatarController(req, res) {
//   try {
//     const userId = req.userId;
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded", success: false });
//     }

//     const uploadedUrls = [];

//     for (let i = 0; i < files.length; i++) {
//       const result = await cloudinary.uploader.upload(files[i].path, {
//         use_filename: true,
//         unique_filename: false,
//         overwrite: true,
//       });

//       uploadedUrls.push(result.secure_url);
//       fs.unlinkSync(`uploads/${files[i].filename}`); // Delete local temp file
//     }

//     // Update user avatar in DB (only first image as avatar)
//     const updatedUser = await userModel.findByIdAndUpdate(
//       userId,
//       { avatar: uploadedUrls[0] },
//       { new: true }
//     );

//     return res.status(200).json({
//       _id: updatedUser._id,
//       avatar: updatedUser.avatar
//     });

//   } catch (error) {
//     console.error("Avatar Upload Error:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: true, success: false });
//   }
// }

//remove imgae form cloudanary
///api/user?removeImg=?img1.jpg
export async function removeImageController(request, response) {
  const imgUrl = request.query.img; //img1.jpg ka url
  //https://res.cloudinary.com/dawav6pbh/image/upload/v1755235469/1755235462841_Screenshot_1.png" come like this
  const urlArr = imgUrl.split("/");
  // ["https:","res.cloudinary.com","dawav6pbh","image","upload","v1755235469","1755235462841_Screenshot_1.png"]
  const image = urlArr[urlArr.length - 1];
  //["1755235462841_Screenshot_1.png"]
  const imageName = image.split(".")[0];
  //split the png from the image name
  if (imageName) {
    const res = await cloudinary.uploader.destroy( //remove image
      imageName,
      (error, result) => { }
    );

    if (res) {
      response.status(200).send(res);
    }
  }
}


//update user detail
export async function updateUserDetailsController(request, response) {
  try {
    const userId = request.userId || request.params.id;//taking user id from middleware
    const { name, email, mobile, password } = request.body;

    const userExist = await userModel.findById(userId);
    if (!userExist)
      return response.status(400).send('The user cannot be Updated!');

    let verifyCode = "";
    //if mail and usernot match then send mail to user
    if (email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    //password hashsing
    let hashPassword = ""

    if (password) {
      const salt = await bcryptjs.genSalt(10)
      hashPassword = await bcryptjs.hash(password, salt)
    } else {
      hashPassword = userExist.password
    }
    //user upadate
    const updateUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email,
        verify: email ? false : true,
        password: hashPassword,
        otp: verifyCode == "" ? verifyCode : null,
        otpExpires: verifyCode == "" ? Date.now() + 600000 : "",
      },
      { new: true }
    )
    if (email !== userExist.email) {
      // Send verification email
      await sendEmailFun({
        sendTo: email,
        subject: "Verify email from Ecommerce App",
        text: "",
        html: VerificationEmail(name, verifyCode)
      })
    }
    return response.json({
      message: "user upadate successfully",
      success: "true",
      error: "false",
      user: {
        name: userUpdate.name,
        _id: userUpdate._id,
        email: userUpdate.email,
        mobile: userUpdate.mobile,
        avatar: userUpdate.avatar,
      }
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",

      error: "true"
    })
  }
}

//for forgot password
export async function forgotPassword(request, response) {
  try {
    const { email } = request.body;
    const user = await userModel.findOne({ email });
    //if user not found
    if (!user) {
      return response.status(404).json({
        message: "email not found",
        error: "true",
        success: "false"
      })
    }
    //if found otp generates
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const updateUser = await userModel.findByIdAndUpdate(
      user?._id,
      {
        otp: verifyCode,
        otpExpires: Date.now() + 600000
      },
      { new: true }
    )

    await sendEmailFun(email, //mail sending
      "Verify your email",
      "",
      `<p>Hello ${updateUser?.name}, your verification code is <b>${verifyCode}</b></p>`)

    return response.json({
      message: "check your email",
      success: true,
      error: false,
      user: updateUser
    })

  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//verify otp for forgot password
export async function verifyOtp(request, response) {
  try {
    const { email, otp } = request.body;
    const user = await userModel.findOne({ email });

    //if user not found
    if (!user) {
      return response.status(404).json({
        message: "email not found",
        error: "true",
        success: "false"
      })
    }
    //if otp is  wrong
    if (otp !== user.otp) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: "true",
        success: "false"
      })
    }
    //if otp or email is empty
    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required field email, otp.",
        error: true,
        success: false
      });
    }
    //if otp expired
    if (Date.now() > user.otpExpiresAt) {
      return response.status(400).json({
        message: "OTP expired",
        error: "true",
        success: "false"
      })
    }
    //if otp is correct
    user.otp = "";
    user.otpExpires = "";

    await user.save();

    return response.status(200).json({
      message: "Verify OTP successfully",
      error: false,
      success: true
    });

  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }

}

//reset password
export async function resetPassword(request, response) {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = request.body;
    //if password field is emty
    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message: "provide required fields email, newPassword, confirmPassword"
      });
    }

    const user = await userModel.findOne({ email });
    //if user not found
    if (!user) {
      return response.status(400).json({
        message: "Email is not available",
        error: true,
        success: false
      });
    }
    if(user.signUpWithGoogle === false){
       // if old password is not match
    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Old Password is not match",
        success: false,
        error: true
      })
    }
    }
    //if password is not match
    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "Password and Confirm Password does not match",
        success: false,
        error: true
      })
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    //update password
    const update = await userModel.findOneAndUpdate(user._id, {
      password: hashPassword
    });

    return response.json({
      message: "Password updated successfully.",
      error: false,
      success: true
    });
  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//refresh token upadate
export async function refreshTokens(request, response) {
  try {
    //find refresh token
    const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]; // [ Bearer token ]

    if (!refreshToken) {
      return response.status(401).json({
        message: "Invalid token",
        error: true,
        success: false
      });
    }
    //verify token
    const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);

    if (!verifyToken) {
      return response.status(401).json({
        message: "token is expired",
        error: true,
        success: false
      });
    }

    const userId = verifyToken?._id;
    const newAccessToken = await generateAccessTocken(userId);
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    response.cookie('accessToken', newAccessToken, cookiesOption);
    return response.json({
      message: "Token refreshed successfully.",
      success: true,
      error: false,
      data: {
        accessToken: newAccessToken
      }
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//get login user details 
export async function userDetails(request, response) {
  try {
    const userId = request.userId; //userId is middleware that state that is  user active or not

    console.log(userId);

    const user = await userModel.findById(userId).select('-password -refresh_token'); //after select we donnt need that item

    return response.json({
      message: 'user details',
      data: user,
      error: false,
      success: true
    });
  } catch (error) {

    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}


//review controller create
export async function createReviewController(request, response) {
  try{
    const {image,userName,review,rating,userId,productId}=request.body;
    const reviews=new reviewModel({ //crete new review object
      image:image,
      userName:userName,
      review:review,
      rating:rating,
      userId:userId,
      productId:productId
    })
    await reviews.save(); //save in database
    return response.status(201).json({
      message:"Review submitted successfully",
      success:true,
      error:false
    })
  }
   catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}

//get all review
export async function getAllReviewController(request, response) {
  try{
    const productId=request.query.productId;

    const reviews=await reviewModel.find({productId:productId}).sort({createdAt:-1}) //find all review and sort by date
    if(!reviews){
      return response.status(404).json({ //if no review found
        message:"No review found",
        error:true,
        success:false
      })
    }
    return response.status(200).json({ //return all review
      message:"All review list",
      success:true,
      error:false,
      data:reviews
    })
  }
   catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}

export async function getAllUserController(request, response) {
  try{
    const users=await userModel.find();
    if(!users){
      return response.status(404).json({ //if no review found
        message:"No user found",
        error:true,
        success:false
      })
    }
    return response.status(200).json({ //return all review
      message:"All User list",
      success:true,
      error:false,
      data:users
    })
  }
   catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}

export async function getAllRevController(request, response) {
  try{
    const users=await reviewModel.find();
    if(!users){
      return response.status(404).json({ //if no review found
        message:"No review found",
        error:true,
        success:false
      })
    }
    return response.status(200).json({ //return all review
      message:"All review list",
      success:true,
      error:false,
      data:users
    })
  }
   catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}

//delte the user
export async function deleteUserController(request, response) {
   try {
        const _id = request.params.id; //id to delete product id help to delete form shoping cart in usermodel to delete
        if (!_id) {
            return response.status(400).json({
                message: "provide the id",
                success: false,
                error: true
            })
        }
        //cart id to delete
        const deleteCartItem = await userModel.deleteOne({
            _id: _id, //product id
        });

        return response.json({
            message: "Item remove",
            error: false,
            success: true,
            data: deleteCartItem
        });
    }
   catch (error) {
    return response.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false
    });
  }
}

