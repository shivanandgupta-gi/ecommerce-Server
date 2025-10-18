//this is for the cart model table

import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productTitle: {
     type: String,
      required: true 
    },
    image:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    subTotal:{
        type: Number,
        required: true
    },
    productId:{
        type:String,
        required: true
    },
    countInStock:{
        type: Number,
        required: true
    },
    userId:{
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const CartProductModel = mongoose.model('cartProduct', cartProductSchema);
export default CartProductModel;