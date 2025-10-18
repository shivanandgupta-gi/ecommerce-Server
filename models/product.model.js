import mongoose from 'mongoose';

const product=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
            type: String,
            required: true
        }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    catName: {
        type: String,
        default: ''
    },
    catId: {
        type: String,
        default: ''
    },
    subCatId: {
        type: String,
        default: ''
    },
    subCat: {
        type: String,
        default: ''
    },
    thirdsubCat:{
        type:String,
        default:''
    },
    thirdsubCatId:{
        type:String,
        default:''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'catergory',
    },
    countInStock: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    sale: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        required: true
    },
    productRam:[
        {
            type: String,
            default: null
        }
    ],
    size: [
        {
            type: String,
            default: null
        }
    ],
    productWeight: [
        {
            type: String,
            default: null
        }
    ],
    dateCreated:{
        type:Date,
        default:Date.now
    },
    //this for the banner like homeslider2 50% one image and rest 50% 2 image
    bannerimages: [{
            type: String,
            required: true
    }],
    bannerTitlename:{
        type:String,
        required:true
    },
     isDisplayOnHomeBanner:{ //this for the shown that image is display on banner or not when switch button click on then shown on screen else not shown
        type:Boolean,
        default:false
    },
    
},{timestamps:true});

const ProductModel=mongoose.model("productModel",product);
export default ProductModel;