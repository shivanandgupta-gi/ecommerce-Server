//mini ads box

import mongoose from "mongoose";

const bannerV1Schema=new mongoose.Schema({
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
    images:[
        {                          
            type:String,
        }
    ],
},{timestamps:true})

const adsModel=mongoose.model("adsModel",bannerV1Schema);
export default adsModel;