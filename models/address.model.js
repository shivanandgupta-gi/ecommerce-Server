//blueprint of table of address

import mongoose from "mongoose";

const addressSchema=mongoose.Schema({
    address_line: {
    type: String,
    default: ""
    },
    city: {
    type: String,
    default: ""
    },
    state: {
    type: String,
    default: ""
    },
    pincode: {
    type: String
    },
    country: {
    type: String
    },
    mobile: {
    type: Number,
    default: null
    },
    status: {
    type: Boolean,
    default: true
    },
    userId: {
    type: mongoose.Schema.ObjectId,
    default: ""
    },
} ,
{timestamp:true});

const addressModel=mongoose.model("address",addressSchema)

export default addressModel;