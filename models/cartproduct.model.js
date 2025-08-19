//this is for the cart model table

import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'productModel'
    },
    quantity: {
        type: Number,
        default: 1
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

const CartProductModel = mongoose.model('cartProduct', cartProductSchema);

export default CartProductModel;