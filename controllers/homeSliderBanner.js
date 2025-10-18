import { v2 as cloudinary } from 'cloudinary'
import { error } from "console";
import fs from 'fs';
import HomeSliderModel from '../models/homeSliderBanner.js';


cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});
var imageArr=[];

// for image upload by cloudinary  
export async function uploadBannerImage(request, response) {
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

      //to copy all upload image in global image array
     imageArr.push(result.secure_url);
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

//create Homesliderbanner  image upload  on above with theri link 
export async function addHomeSlider(request,response) {
    try{
        //for category name
        let slide = new HomeSliderModel({
            //images: request.body.images || [],
            images: imageArr
        });

        if (!slide) {
        response.status(500).json({
            message: "Failed to save slider",
            error: true,
            success: false,
        });
        }
        //save category
        slide=await slide.save();
        imageArr=[]; //after save array will blank
        return response.status(200).json({
            message: "slider created successfully",
            error: false,
            success: true,
            data:slide
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

//for all slide 
export async function getAllSlider(request,response) {
    try{
        const slide = await HomeSliderModel.find(); 
        
        if(!slide){
            return response.status(404).json({
                 message: "Slider not found",
                success:false,
                error:true
            })
        }
        return response.status(200).json({
            message: "Categories fetched successfully",
            success: true,
            error: false,
            data: slide
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

//get slide by id 
export async function getSliderById(request,response) {
    try{
        //find by id
        const category=await HomeSliderModel.findById(request.params.id);
        if(!category){
            response.status(500).json({
                success:false,
                error:true,
                message:"slide not found"
            })
        }
        return response.status(200).json({
            error:false,
            success:true,
            data:category
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
export async function removeImageController(request,response) {
  const imgUrl=decodeURIComponent(request.query.img); //img1.jpg ka url
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

// delete slide
export async function deleteSlide(request, response) {
    try {
        const category = await HomeSliderModel.findById(request.params.id);
        if (!category) {
            return response.status(404).json({
                message: "Slide not found",
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
        // ✅ delete main category
       const deleteslide= await HomeSliderModel.findByIdAndDelete(request.params.id);
        return response.status(200).json({
            message: "slider deleted successfully",
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

//update the slide
export async function updateSlide(request, response) {
    try{
        const category=await HomeSliderModel.findByIdAndUpdate(
            request.params.id,
            {
                images: imageArr.length>0?imageArr[0] : request.body.images,
            },
            { new: true }
        )
        if(!category){
            response.status(404).json({
                message: "Slide not found",
                success:false,
                error:true
          })
        }
        //image null
        imageArr=[];
        response.status(200).json({
            message: "slide updated successfully",
            success:true,
            error:false,
            data:category
        })
    }
    catch(error){
      console.error(error)
        return response.status(500).json({
        message: "Internal Server Error",
        success:false,
        error:true
      })
  }
}  


