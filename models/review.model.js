import moongoose from 'mongoose';

const reviewSchem=new moongoose.Schema({
    image:{
        type:String,
        default:""
    },
    userName:{
        type:String,
        default:""
    },
    review:{
        type:String,
        default:""
    },
    rating:{
        type:String,
        default:""
    },
    userId:{
        type:String,
        default:""
    },
     productId:{
        type:String,
        default:""
    }
},{timestamps:true})

const reviewModel=moongoose.model('Review',reviewSchem);
export default reviewModel;