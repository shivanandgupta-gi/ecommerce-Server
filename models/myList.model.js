import mongoose from 'mongoose';

const myListschema=new mongoose.Schema({
       productId: {
            type: String,
            required:true
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        productTitle: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        oldPrice: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        brand: {
            type: String,
            required: true
        }
},{timestamps:true})

const MyListModel=mongoose.model("MyList",myListschema);
export default MyListModel;