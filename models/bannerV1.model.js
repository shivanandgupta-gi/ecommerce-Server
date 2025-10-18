//this for the shown two banner like  half of 50% in home page is two ads bannerV1 
//mini ads box

import mongoose from "mongoose";

const bannerV1Schema=new mongoose.Schema({
    title:{
        type:String,
        default:"",
    },
    catId:{
        type:String,
        default:"",
    },
    subCatId:{
        type:String,
        default:"",
    },
    thirdsubCatId:{
        type:String,
        default:"",
    },
    Price:{
        type:Number,
        default:"",
    },
    images:[
        {                          
            type:String,
        }
    ],
    alignInfo:{
        type:String,
        default:'',
        required:true
    }
},{timestamps:true})

const bannerV1Model=mongoose.model("bannermini",bannerV1Schema);
export default bannerV1Model;