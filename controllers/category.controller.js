import categoryModel from "../models/category.model.js";
import { v2 as cloudinary } from 'cloudinary'
import { error } from "console";
import fs from 'fs';


cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});
var imageArr=[];

//for image upload by cloudanary
export async function uploadImages(request,response) {
  try{

    const image=request.files;
    for (let i = 0; i < image?.length; i++) { //? is chaning method to optional check one by one if true then next if null then return undefined
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };
      //upload
      await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          if (result) {
            imageArr.push(result.secure_url);
            fs.unlinkSync(`uploads/${request.files[i].filename}`); //Deletes a file synchronously from your local file system  Path to the locally saved file.
            console.log(request.files[i].filename);//uploads folder first load onit and then delete automatic
          }
        }
      );
    }
    
   

    return response.status(200).json({
      image:imageArr[0]
    });
  }
  catch(error){
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      error:true,
      success:false
  })
}
}

//create category name  image upload  on above with theri link 
export async function createCategory(request,response) {
    try{
        //for category name
        let category = new categoryModel({
            name: request.body.name,
            images: imageArr,
            color: request.body.color,
            parentId: request.body.parentId,
            parentCatName: request.body.parentCatName,
        });

        if (!category) {
        response.status(500).json({
            message: "Failed to save category",
            error: true,
            success: false,
        });
        }
        //save category
        category=await category.save();
        imageArr=[]; //after save array will blank
        return response.status(500).json({
            message: "Category created successfully",
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

//get all category (fetch the category)like
// {
//     _id:45566,
//     name:"Electronics",
//     parentid:null  //if null means it is category we fetch this
// }
// {
//     _id:45567,
//     name:"bulb",
//     parentid:45566 //if not null means it is sub category
// }
export async function getAllCategory(request,response) {
    try{
        const categories = await categoryModel.find(); 
        const categoryMap = {};

        categories.forEach(cat => {
        categoryMap[cat._id] = { ...cat._doc, children: [] };
        });

        const rootCategories = [];

        categories.forEach(cat => {
        if (cat.parentId) {
            categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
        } else {
            rootCategories.push(categoryMap[cat._id]);
        }
        });
        return response.status(200).json({
            message: "Categories fetched successfully",
            success: true,
            error: false,
            categories: rootCategories
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

//for counting how many category
export async function countCategory(request,response) {
    try{
        const categoryCount = await categoryModel.countDocuments({ parentId: undefined });

        if (!categoryCount) {
        response.status(500).json({ success: false });
        } else {
        response.send({
            categoryCount: categoryCount,
        });
        }
    }
    catch(error){
        console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//for counting subCategory
export async function countSubCategory(request,response) {
    try{
        const categoryCount = await categoryModel.find(); //categorymodel is table or collection

        if (!categoryCount) {
        response.status(500).json({ success: false });
        }
        else{
            const subcat=[];
            for(let cat of categoryCount){
                if(cat.parentId !== undefined){
                subcat.push(cat)
            }
        }
        }
        response.status(200).json({
            subCategoryCount: subcat.length,
            success:true,
            error:false
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

//get category by id 
export async function getCategoryById(request,response) {
    try{
        //find by id
        const category=await categoryModel.findById(request.params.id);
        if(!category){
            response.status(500).json({
                success:false,
                error:true,
                message:"Category not found"
            })
        }
        return response.status(200).json({
            error:false,
            success:true,
            category:category
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
      response.status(200).send(res);
    }
  }
}

//delte category
export async function deleteCategoryController(request,response) {
    try{
        const category = await categoryModel.findById(request.params.id);
        const images = category.images;
        //same as above
        for (let img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0];

        cloudinary.uploader.destroy(imageName, (error, result) => {
            
        });
        }
        //if category delete then sub category also delete
        const subCategory = await categoryModel.find({
        parentId: request.params.id
        });
        for (let i = 0; i < subCategory.length; i++) {
            const thirdsubCategory = await categoryModel.find({
                parentId: subCategory[i]._id
            });

            for (let i = 0; i < thirdsubCategory.length; i++) {
                const deletedThirdSubCat = await categoryModel.findByIdAndDelete(thirdsubCategory[i]._id);
            }

            const deletedSubCat = await categoryModel.findByIdAndDelete(subCategory[i]._id);
        }
        const deletcat=await categoryModel.findByIdAndDelete(request.params.id);
        if(!deletcat){
            response.status(404).json({
                message: "Category not found",
                success:false,
                error:true
            })
        }
        response.status(200).json({
            message: "Category deleted successfully",
            success:true,
            error:false
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

//update the category
export async function updateCategory(request, response) {
    try{
        const category=await categoryModel.findByIdAndUpdate(
            request.params.id,
            {
                name: request.body.name,
                images: imageArr.length>0?imageArr[0] : request.body.images,
                parentId: request.body.parentId,
                parentCatName: request.body.parentCatName
            },
            { new: true }
        )
        if(!category){
            response.status(404).json({
                message: "Category not found",
                success:false,
                error:true
            })
        }
        //image null
        imageArr=[];
        response.status(200).json({
            message: "Category updated successfully",
            success:true,
            error:false,
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




