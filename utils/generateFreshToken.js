//Access tokens and refresh tokens are mostly used in 
// //authentication systems to keep a user logged in securely without making them enter their username/password every time.

import UserModel from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generatedRefreshToken = async (userId) => {
    const token = await jwt.sign({ id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    )

    const updateRefreshTokenUser = await UserModel.updateOne(
        { _id: userId },
        {
            refresh_token: token
        }
    )

    return token
}

export default generatedRefreshToken