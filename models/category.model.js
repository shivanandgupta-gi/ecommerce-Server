//for category detail schema or table in database

import mongoose from 'mongoose'

const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
        images: [{
        type: String,
        }],
    color: {
        type: String,
    },
    parentCatName: {
        type: String,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    }, { timestamps: true });

    const categoryModel=mongoose.model("catergory",categorySchema);

    export default categoryModel;
