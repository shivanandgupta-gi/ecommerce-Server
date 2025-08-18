import ProductModel from "../models/product.model.js";
import { v2 as cloudinary } from 'cloudinary'
import { error } from "console";
import fs from 'fs';


//for images upload
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

//create product in database
export async function createProduct(request,response) {
    try{
        
        //new product object created
        let product = new ProductModel({
            name: request.body.name,
            description: request.body.description,
            images: imageArr,
            brand: request.body.brand,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            catName: request.body.catName,
            catId: request.body.catId,
            subCatId: request.body.subCatId,
            subCat: request.body.subCat,
            thirdsubCat: request.body.thirdsubCat,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            discount: request.body.discount,
            productRam: request.body.productRam,
            size: request.body.size,
            productWeight: request.body.productWeight,
            dateCreated: request.body.dateCreated,
        });
        //save the product
        product=await product.save();
        //check if not save
        if(!product){
            return response.status(400).json({
                message: "Product not saved",
                error:true,
                success:false
            })
        }
        imageArr=[];//save as null 
        return response.status(200).json({
            message: "Product created successfully",
            error:false,
            success:true
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

//to get all products 
//api  =>  http://localhost:8000/api/product/getAllProduct?page=1&perPage=5
export async function getProducts  (request, response)  {
  try{
    //pages added (pagination)
    // parseInt() is a built-in JavaScript function that converts a string into an integer.
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return response.status(404).json({
            message: "Page not found",
            success: false,
            error: true
        });
    }
    
    //finding all product
    //const page = 2;  const perPage = 5;
    const products=await ProductModel.find().populate("category")
    .skip((page-1)*perPage)  //skip 5 documents
    .limit(perPage)  //retunn  5 documents
    .exec();
    //check if not found
    if(!products){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
      totalPages:totalPages,
      page : page
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

//to get all product by categoryID
export async function getProductsByCategoryId  (request, response)  {
  try{
    //pages added (pagination)
    // parseInt() is a built-in JavaScript function that converts a string into an integer.
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 5;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return response.status(404).json({
            message: "Page not found",
            success: false,
            error: true
        });
    }
    
    //finding all product
    //const page = 2;  const perPage = 5;
    const products=await ProductModel.find({catId:request.params.id}).populate("category")
    .skip((page-1)*perPage)  //skip 5 documents
    .limit(perPage)  //retunn  5 documents
    .exec();
    //check if not found
    if(!products){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
      totalPages:totalPages,
      page : page
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

//to get all product by category name
export async function getProductsByCategoryName (request, response)  {
  try{
    //pages added (pagination)
    // parseInt() is a built-in JavaScript function that converts a string into an integer.
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return response.status(404).json({
            message: "Page not found",
            success: false,
            error: true
        });
    }
    
    //finding all product
    //const page = 2;  const perPage = 5;
     const catName = request.params.catName; 
    const products=await ProductModel.find({catName:catName}).populate("category")
    .skip((page-1)*perPage)  //skip 5 documents
    .limit(perPage)  //retunn  5 documents
    .exec();
    //check if not found
    if(!products){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
      totalPages:totalPages,
      page : page
    })
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

//find product by subcategory id 
export async function getProductsBySubCategoryId (request, response)  {
  try{
    //pages added (pagination)
    // parseInt() is a built-in JavaScript function that converts a string into an integer.
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return response.status(404).json({
            message: "Page not found",
            success: false,
            error: true
        });
    }
    
    //finding all product
    //const page = 2;  const perPage = 5;
     const subCatId = request.params.id; 
    const products=await ProductModel.find({subCatId:subCatId}).populate("Category")
    .skip((page-1)*perPage)  //skip 5 documents
    .limit(perPage)  //retunn  5 documents
    .exec();
    //check if not found
    if(!products){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
      totalPages:totalPages,
      page : page
    })
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


//find product by subcategory name
export async function getProductsBySubCategoryName (request, response)  {
  try{
    //pages added (pagination)
    // parseInt() is a built-in JavaScript function that converts a string into an integer.
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return response.status(404).json({
            message: "Page not found",
            success: false,
            error: true
        });
    }
    
    //finding all product
    //const page = 2;  const perPage = 5;
     const subCat = request.params.subCat; 
    const products=await ProductModel.find({subCat:subCat}).populate("Category")
    .skip((page-1)*perPage)  //skip 5 documents
    .limit(perPage)  //retunn  5 documents
    .exec();
    //check if not found
    if(!products){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
      totalPages:totalPages,
      page : page
    })
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

//like third level subcategory id and name find same as above if we required

//filter by price and get product
export async function priceFilter(request,response) {
  try{
    let productList = [];
    //by category id like fashion
    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category");

        productList = productListArr;
    }
    //by subcategory id like men 
    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId,
        }).populate("category");

        productList = productListArr;
    }
    //by third level subcatgory id like t-shirt , jeans
    if (request.query.thirdsubCatId !== "" && request.query.thirdsubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdsubCatId: request.query.thirdsubCatId,
        }).populate("category");

        productList = productListArr;
    }
    //to filter all the filter according to min and max price
    const filteredProducts = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(request.query.maxPrice)) {
            return false;
        }
        return true;
    });

    return response.status(200).json({
      message: "Product list",
      data: filteredProducts,
      totalPages:0,
      page:0,
      success: true,
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

//filter by rating
export async function getProductsByRating (request, response)  {
  try{
    //pages added (pagination)
    // parseInt() is a built-in JavaScript function that converts a string into an integer.
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return response.status(404).json({
            message: "Page not found",
            success: false,
            error: true
        });
    }
    
    //finding all product
    //const page = 2;  const perPage = 5;
     const rating = request.query.rating; 
     let products=[];
     //rating by category
     if(request.query.catId !== undefined){
        products=await ProductModel.find({rating:rating,
        catId:request.query.catId
      }).populate("category")
      .skip((page-1)*perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
     }
     //rating by subcategory
      if(request.query.subCatId !== undefined){
        products=await ProductModel.find({rating:rating,
        subCatId:request.query.subCatId
      }).populate("category")
      .skip((page-1)*perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
     }
     //rating by third subcategory
      if(request.query.thirdsubCatId !== undefined){
        products=await ProductModel.find({rating:rating,
        thirdsubCatId:request.query.thirdsubCatId
      }).populate("category")
      .skip((page-1)*perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
     }
    //check if not found
    if(products .length===0){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
      totalPages:totalPages,
      page : page
    })
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

//count the product
export async function countProduct(request,response){7
  try{
    const productcount=await ProductModel.countDocuments();
    if(!productcount){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products count found successfully",
      error:false,
      success:true,
      productcount
    })
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

//featured product get (a Featured Product means a product that the admin or store owner wants to highlight or promote.)
export async function getFeaturedProduct (request, response)  {
  try{
    
    //finding all product
    //const page = 2;  const perPage = 5;
    const products=await ProductModel.find({isFeatured : true}).populate("category")
    
    //check if not found
    if(!products){
      return response.status(400).json({
        message: "No products found",
        error:true,
        success:false
        })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error:false,
      success:true,
      products:products,
    })
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

//delete product by id
export async function deleteProduct (request, response)  {
  try{
    const product=await ProductModel.findById(request.params.id).populate("category");
    if(!product){
      return response.status(400).json({
        message: "Product not found",
        error:true,
        success:false
        })
      }
      //delete images
      const images = product.images;

      for (let img of images) {
          const imgUrl = img;
          const urlArr = imgUrl.split("/");
          const image = urlArr[urlArr.length - 1];

          const imageName = image.split(".")[0];

          if (imageName) {
              cloudinary.uploader.destroy(imageName, (error, result) => {
              });
          }
      }
      //delete product
      const deleteProduct=await ProductModel.findByIdAndDelete(request.params.id);
      if(deleteProduct){
        return response.status(200).json({
          message: "Product deleted successfully",
          error:false,
          success:true
        })
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

//get single product by their id
export async function getSingleProduct (request, response)  {
  try{
    const product=await ProductModel.findById(request.params.id).populate("category");
    if(!product){
      return response.status(400).json({
        message: "Product not found",
        error:true,
        success:false
        })
      }
      return response.status(200).json({
        product:product,
        error:false,
        success:true
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

//delete images 
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

//update the product
export async function updateProductController(request, response) {
  try {
    const product=await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        subCat: request.body.subCat,
        description: request.body.description,
        images: request.body.images,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catId: request.body.catId,
        subCatId: request.body.subCatId,
        catName: request.body.catName,
        category: request.body.category,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatId: request.body.thirdsubCatId,
        countInStock: request.body.countInStock,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        productRam: request.body.productRam,
        size: request.body.size,
        productWeight: request.body.productWeight,
        },
        { new: true }
    )
    if(!product){
      return response.status(404).send({
        message:"Product not updated",
        success:false,
        error:true
      })
    }
    imageArr=[];
    return response.status(200).json({
      message: "Product updated successfully",
      success: true,
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