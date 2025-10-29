 import { v2 as cloudinary } from 'cloudinary'
 import { error } from "console";
 import fs from 'fs';
import adsModel from '../models/ads.model.js';
 
 ////this for the shown two banner like  half of 50% in home page is two ads bannerV1 
 //** or mini ads box

 cloudinary.config({
   cloud_name: process.env.cloudinary_Config_Cloud_Name,
   api_key: process.env.cloudinary_Config_api_key,
   api_secret: process.env.cloudinary_Config_api_secret,
   secure: true,
 });
 var imageArr=[];
 
 // for image upload by cloudinary  
 export async function uploadImages(request, response) {
   try {
     const files = request.files;
     let uploadedImages = [];
 
     for (let i = 0; i < files?.length; i++) {
       const result = await cloudinary.uploader.upload(files[i].path, {
         use_filename: true,
         unique_filename: true,
         overwrite: false,
       });
 
       // delete local file after upload
       fs.unlinkSync(files[i].path);
 
       uploadedImages.push(result.secure_url);
       console.log("Uploaded:", files[i].filename);
     }
 
     return response.status(200).json({
       success: true,
       allImages: imageArr   ,     // optional: global store
       images: uploadedImages,   // ✅ send array of all uploaded URLs
     });
      } catch (error) {
     console.error("Upload error:", error);
     return response.status(500).json({
       message: "Internal Server Error",
       error: true,
       success: false,
     });
   }
 }

 //create banner* name  image upload  on above with theri link 
export async function addBanner(request,response) {
    try{
        //for category name
        let category = new adsModel({
            images: request.body.images || [],
        });

        //save category
        category=await category.save();
        imageArr=[]; //after save array will blank
        return response.status(200).json({
            message: "Ads banner created successfully",
            error: false,
            success: true,
            category:category
        })
    }
    catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }

}

//for all category obtained
export async function getAllBanner(request,response) {
    try{
        const banners = await adsModel.find(); 
       
        if(!banners){
             return response.status(400).json({
            message: "No Banner found",
            success: false,
            error: true,
        });
        }
        return response.status(200).json({
            message: "Categories fetched successfully",
            success: true,
            error: false,
            banner: banners
        });
    }
    catch(error){
        return response.status(500).json({
        message: "Internal Server Error",
        success:false,
        error:true
        })
    }

}

// delete banner
export async function deleteBannersController(request, response) {
    try {
        const category = await adsModel.findById(request.params.id);

        if (!category) {
            return response.status(404).json({
                message: "banner not found",
                success: false,
                error: true
            });
        }
        // ✅ delete images safely
        if (category.images && category.images.length > 0) {
            for (let img of category.images) {
                try {
                    const urlArr = img.split("/");
                    const image = urlArr[urlArr.length - 1];
                    const imageName = image.split(".")[0];
                    await cloudinary.uploader.destroy(imageName);
                } catch (err) {
                    console.error("Error deleting image from Cloudinary:", err);
                }
            }
        }   
        // ✅ delete banner
        await adsModel.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            message: "banner deleted successfully",
            success: true,
            error: false
        });
    } catch (error) {
        console.error("Delete Category Error:", error);
        return response.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
        });
    }
}   

//get category by id 
export async function getBannerById(request,response) {
    try{
        //find by id
        const category=await adsModel.findById(request.params.id);
        if(!category){
            response.status(500).json({
                success:false,
                error:true,
                message:"banner not found"
            })
        }
        return response.status(200).json({
            error:false,
            success:true,
            banner:category
        })
    }catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//delete image for cloudananry
export async function removeImageBlogController(request,response) {
  const imgUrl=request.query.img; //img1.jpg ka url
  //https://res.cloudinary.com/dawav6pbh/image/upload/v1755235469/1755235462841_Screenshot_1.png" come like this
   const urlArr = imgUrl.split("/");
  // ["https:","res.cloudinary.com","dawav6pbh","image","upload","v1755235469","1755235462841_Screenshot_1.png"]
  const image = urlArr[urlArr.length - 1];
  //["1755235462841_Screenshot_1.png"]
  const imageName = image.split(".")[0];
  //split the png from the image name
  if (imageName) {
    const res = await cloudinary.uploader.destroy( //remove image
      imageName,
      (error, result) => {}
    );

    if (res) {
      return response.status(200).send(res).json({
        message: "Image deleted successfully",
        success: true,
        error: false,
      }
      );
    }
  }
}


