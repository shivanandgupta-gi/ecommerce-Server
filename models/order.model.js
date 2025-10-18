import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products:[
        {
            productId: {
                type: String
            },
            productTitle:{
                type:String
            },
            quantity:{
                type:Number
            },
            price:{ 
                type:Number
            },
            image:{
                type:String
            },
            subTotal:{
                type:Number
            }
        }
    ],
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true,
        default:uuidv4
    },
    order_status:{
        type:String,
        default:"pending"
    },
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    totalAmt: {
        type: Number,
        default: 0
    },
   
},{timestamps:true});

const OrderModel=mongoose.model("order",orderSchema);

export default OrderModel; 