//this is for schema created in database 
//In MongoDB, a schema is basically the structure or blueprint of how data is organized in a collection.
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"]
    },
    email: {
        type: String,
        required: [true, "Provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Provide password"]
    },
    avatar: {
    type: String,
    default: ""
    },
    mobile: {
        type: Number,
        default: null
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    last_login_date: {
        type: Date,
        default: ""
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"], //only one passes
        default: "Active"
    },
    address_details: [ 
        {
            type: mongoose.Schema.ObjectId,
            ref: 'address'  //new table of address
        }
    ],
    shopping_cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'cartproduct'  //new tabel of shopping cart
        }
    ],
    orderHistory: [
    {
        type: mongoose.Schema.ObjectId,
        ref: 'order'
    }
    ],
    otp:{
        type: String,
    },
    otpExpires:{
        type:Date
    },
    forgot_password_otp: {
        type: String,
        default: null
    },
    forgot_password_expiry: {
        type: Date,
        default: ""
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },
    signUpWithGoogle:{
        type:Boolean,
        default:false
    },
    access_token:{
        type:String,
        default:''
    },
    refresh_token:{
        type:String,
        default:''
    } 
},{timestamps:true}
);

const userModel=mongoose.model("User",userSchema);

export default userModel;
