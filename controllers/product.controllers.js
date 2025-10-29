import ProductModel from "../models/product.model.js";
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';
import ProductRAMSModel from "../models/productRAMS.js";
import ProductWeightModel from "../models/productWeight.js";
import ProductSizeModel from "../models/productSize.js";
import { error } from "console";


//for images upload
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});
var imageArr = [];

//for image upload by cloudanary
export async function uploadImages(request, response) {
  try {
    const image = request.files;
    const uploadedUrls = [];
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
            uploadedUrls.push(result.secure_url);
            imageArr.push(result.secure_url); //pushing in banner images
            fs.unlinkSync(`uploads/${request.files[i].filename}`); //Deletes a file synchronously from your local file system  Path to the locally saved file.
            console.log(request.files[i].filename);//uploads folder first load onit and then delete automatic
          }
        }
      );
    }
    return response.status(200).json({
      image: uploadedUrls
    });
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}

//create product in database
export async function createProduct(request, response) {
  try {
    console.log("Incoming Data:", request.body);
    //new product object created
    let product = new ProductModel({
      name: request.body.name,
      description: request.body.description,
      images: imageArr,
      bannerimages: bannerImg,
      brand: request.body.brand,
      price: request.body.price,
      oldPrice: request.body.oldPrice,
      catName: request.body.catName,
      category: request.body.category,
      catId: request.body.catId,
      subCatId: request.body.subCatId,
      subCat: request.body.subCat,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatId: request.body.thirdsubCatId,
      countInStock: request.body.countInStock,
      rating: request.body.rating,
      isFeatured: request.body.isFeatured,
      discount: request.body.discount,
      productRam: request.body.productRam,
      size: request.body.size,
      productWeight: request.body.productWeight,
      dateCreated: request.body.dateCreated,
      bannerTitlename: request.body.bannerTitlename,
      isDisplayOnHomeBanner: request.body.isDisplayOnHomeBanner,
    });
    //save the product
    product = await product.save();
    //check if not save
    if (!product) {
      return response.status(400).json({
        message: "Product not saved",
        error: true,
        success: false
      })
    }
    imageArr = [];//save as null 
    bannerImg = []; //save as banner image null
    return response.status(200).json({
      message: "Product created successfully",
      error: false,
      success: true
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//to get all products 
//api  =>  http://localhost:8000/api/product/getAllProduct?page=1&perPage=5
export async function getProducts(request, response) {
  try {
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
    const products = await ProductModel.find().populate("category")
      .skip((page - 1) * perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//to get all product by categoryID
export async function getProductsByCategoryId(request, response) {
  try {
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
    const products = await ProductModel.find({ catId: request.params.id }).populate("category")
      .skip((page - 1) * perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//to get all product by category name
export async function getProductsByCategoryName(request, response) {
  try {
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
    const products = await ProductModel.find({ catName: catName }).populate("category")
      .skip((page - 1) * perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//find product by subcategory id 
export async function getProductsBySubCategoryId(request, response) {
  try {
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
    const products = await ProductModel.find({ subCatId: subCatId }).populate("category")
      .skip((page - 1) * perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}


//find product by subcategory name
export async function getProductsBySubCategoryName(request, response) {
  try {
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
    const products = await ProductModel.find({ subCat: subCat }).populate("catergory")
      .skip((page - 1) * perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//like third level subcategory id and name find same as above if we required
export async function getProductsByThirdLevelSubCategoryId(request, response) {
  try {
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
    const products = await ProductModel.find({ subCatId: subCatId }).populate("Category")
      .skip((page - 1) * perPage)  //skip 5 documents
      .limit(perPage)  //retunn  5 documents
      .exec();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}
//filter by price and get product
export async function priceFilter(request, response) {
  try {
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
      totalPages: 0,
      page: 0,
      success: true,
      error: false
    })

  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//filter by rating
export async function getProductsByRating(request, response) {
  try {
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
    let products = [];
    //rating by category
    if (request.query.catId !== undefined) {
      products = await ProductModel.find({
        rating: rating,
        catId: request.query.catId
      }).populate("category")
        .skip((page - 1) * perPage)  //skip 5 documents
        .limit(perPage)  //retunn  5 documents
        .exec();
    }
    //rating by subcategory
    if (request.query.subCatId !== undefined) {
      products = await ProductModel.find({
        rating: rating,
        subCatId: request.query.subCatId
      }).populate("category")
        .skip((page - 1) * perPage)  //skip 5 documents
        .limit(perPage)  //retunn  5 documents
        .exec();
    }
    //rating by third subcategory
    if (request.query.thirdsubCatId !== undefined) {
      products = await ProductModel.find({
        rating: rating,
        thirdsubCatId: request.query.thirdsubCatId
      }).populate("category")
        .skip((page - 1) * perPage)  //skip 5 documents
        .limit(perPage)  //retunn  5 documents
        .exec();
    }
    //check if not found
    if (products.length === 0) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
      totalPages: totalPages,
      page: page
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//count the product
export async function countProduct(request, response) {
  7
  try {
    const productcount = await ProductModel.countDocuments();
    if (!productcount) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products count found successfully",
      error: false,
      success: true,
      productcount
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//featured product get (a Featured Product means a product that the admin or store owner wants to highlight or promote.)
export async function getFeaturedProduct(request, response) {
  try {

    //finding all product
    //const page = 2;  const perPage = 5;
    const products = await ProductModel.find({ isFeatured: true }).populate("category")

    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//delete product by id
export async function deleteProduct(request, response) {
  try {
    const product = await ProductModel.findById(request.params.id).populate("category");
    if (!product) {
      return response.status(400).json({
        message: "Product not found",
        error: true,
        success: false
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
    const deleteProduct = await ProductModel.findByIdAndDelete(request.params.id);
    if (deleteProduct) {
      return response.status(200).json({
        message: "Product deleted successfully",
        error: false,
        success: true
      })
    }
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//get single product by their id
export async function getSingleProduct(request, response) {
  try {
    const product = await ProductModel.findById(request.params.id).populate("category");
    if (!product) {
      return response.status(400).json({
        message: "Product not found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      product: product,
      error: false,
      success: true
    })

  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//delete images 
//delete image for cloudananry
export async function removeImageController(request, response) {
  const imgUrl = decodeURIComponent(request.query.img); //img1.jpg ka url
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
      (error, result) => { }
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

//delete the multiple product at one click
export async function deleteMultipleProduct(request, response) {
  const { id } = request.body; //id in array due to multiple product
  if (!id || !Array.isArray(id)) {
    return response.status(400).json({
      message: "Invalid product id",
      error: true,
      success: false
    })
  }
  //to choose many product to delete image and product
  for (let i = 0; i < id.length; i++) {
    const product = await ProductModel.findById(id[i]);
    const images = product.image; //taking the images
    //delete image
    let img = "";
    for (img of images) { //due to multiple image
      const imageUrl = img;
      const urlArr = imageUrl.split("/")
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {

        })
      }
    }
  }
  //now delete all id of product
  try {
    await ProductModel.deleteMany({ _id: { $in: id } });

    return response.status(200).json({
      message: "Products deleted successfully",
      error: false,
      success: true
    });

  } catch (error) {
    console.error(error)
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

//update the product
export async function updateProductController(request, response) {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        subCat: request.body.subCat,
        description: request.body.description,
        images: request.body.images,
        bannerimages: request.body.bannerImg,
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
        bannerTitlename: request.body.bannerTitlename
      },
      { new: true }
    )
    if (!product) {
      return response.status(404).send({
        message: "Product not updated",
        success: false,
        error: true
      })
    }
    imageArr = [];
    return response.status(200).json({
      message: "Product updated successfully",
      success: true,
      error: false
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//for ram update in list
export async function createRAMS(request, response) {
  try {
    let productRAMS = new ProductRAMSModel({
      name: request.body.name,
    });

    const savedProductRAMS = await productRAMS.save();

    if (!savedProductRAMS) {
      return response.status(500).json({
        error: true,
        success: false,
        message: "Product not created",
      });
    }

    response.status(201).json({
      error: false,
      success: true,
      data: savedProductRAMS,
      message: "Product RAM created successfully",
    });
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}


// Delete Product RAM by ID
export async function deleteProductRAMS(req, res) {
  try {
    const { id } = req.params; // get id from URL

    if (!id) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "RAM id is required",
      });
    }
    const deletedRAM = await ProductRAMSModel.findByIdAndDelete(id);

    if (!deletedRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "RAM not found",
      });
    }
    res.status(200).json({
      error: false,
      success: true,
      message: "RAM deleted successfully",
      data: deletedRAM,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};


// Update Product RAM by ID
export async function updateProductRAMS(req, res) {
  try {
    const { id } = req.params; // RAM ID
    const { name } = req.body; // New name
    if (!id) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "RAM id is required",
      });
    }
    if (!name) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "RAM name is required",
      });
    }
    const updatedRAM = await ProductRAMSModel.findByIdAndUpdate(
      id,
      { name },
      { new: true } // return updated doc
    );
    if (!updatedRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "RAM not found",
      });
    }
    res.status(200).json({
      error: false,
      success: true,
      message: "RAM updated successfully",
      data: updatedRAM,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};

//to get all rams
export async function getProductsRAMS(request, response) {
  try {
    //finding all product rams
    const products = await ProductRAMSModel.find();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      products: products,
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//for get ram by id
export async function getProductsByRAMSId(request, response) {
  try {
    const { id } = request.params;
    //finding all product
    const product = await ProductRAMSModel.findById(id);
    //check if not found
    if (!product) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products found successfully",
      error: false,
      success: true,
      product: product,
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}


//for weight api

//for Weight update in list
export async function createWeight(request, response) {
  try {
    let productRAMS = new ProductWeightModel({
      name: request.body.name,
    });

    const savedProductRAMS = await productRAMS.save();

    if (!savedProductRAMS) {
      return response.status(500).json({
        error: true,
        success: false,
        message: "Product not created",
      });
    }

    response.status(201).json({
      error: false,
      success: true,
      data: savedProductRAMS,
      message: "Product Weight created successfully",
    });
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}


// Delete Product Weight by ID
export async function deleteProductWeight(req, res) {
  try {
    const { id } = req.params; // get id from URL

    if (!id) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Weight id is required",
      });
    }
    const deletedRAM = await ProductWeightModel.findByIdAndDelete(id);

    if (!deletedRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Weight not found",
      });
    }
    res.status(200).json({
      error: false,
      success: true,
      message: "Weight deleted successfully",
      data: deletedRAM,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};


// Update Product Weight by ID
export async function updateProductWeight(req, res) {
  try {
    const { id } = req.params; // RAM ID
    const { name } = req.body; // New name
    if (!id) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Weight id is required",
      });
    }
    if (!name) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Weight name is required",
      });
    }
    const updatedRAM = await ProductWeightModel.findByIdAndUpdate(
      id,
      { name },
      { new: true } // return updated doc
    );
    if (!updatedRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Weight not found",
      });
    }
    res.status(200).json({
      error: false,
      success: true,
      message: "Weight updated successfully",
      data: updatedRAM,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};

//to get all Weight
export async function getProductsWeight(request, response) {
  try {
    //finding all product rams
    const products = await ProductWeightModel.find();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products Weight found successfully",
      error: false,
      success: true,
      products: products,
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//for get Weight by id
export async function getProductsByWeightId(request, response) {
  try {
    const { id } = request.params;
    //finding all product
    const product = await ProductWeightModel.findById(id);
    //check if not found
    if (!product) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products Weight found successfully",
      error: false,
      success: true,
      product: product,
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}


//for size api 

//for Size update in list
export async function createSize(request, response) {
  try {
    let productRAMS = new ProductSizeModel({
      name: request.body.name,
    });

    const savedProductRAMS = await productRAMS.save();

    if (!savedProductRAMS) {
      return response.status(500).json({
        error: true,
        success: false,
        message: "Product not created",
      });
    }

    response.status(201).json({
      error: false,
      success: true,
      data: savedProductRAMS,
      message: "Product Size created successfully",
    });
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}


// Delete Product Size by ID
export async function deleteProductSize(req, res) {
  try {
    const { id } = req.params; // get id from URL

    if (!id) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Size id is required",
      });
    }
    const deletedRAM = await ProductSizeModel.findByIdAndDelete(id);

    if (!deletedRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Size not found",
      });
    }
    res.status(200).json({
      error: false,
      success: true,
      message: "Size deleted successfully",
      data: deletedRAM,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};


// Update Product Size by ID
export async function updateProductSize(req, res) {
  try {
    const { id } = req.params; // RAM ID
    const { name } = req.body; // New name
    if (!id) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Size id is required",
      });
    }
    if (!name) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Size name is required",
      });
    }
    const updatedRAM = await ProductSizeModel.findByIdAndUpdate(
      id,
      { name },
      { new: true } // return updated doc
    );
    if (!updatedRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Size not found",
      });
    }
    res.status(200).json({
      error: false,
      success: true,
      message: "Size updated successfully",
      data: updatedRAM,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};

//to get all Size
export async function getProductsSize(request, response) {
  try {
    //finding all product rams
    const products = await ProductSizeModel.find();
    //check if not found
    if (!products) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products Size found successfully",
      error: false,
      success: true,
      products: products,
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//for get Size by id
export async function getProductsBySizeId(request, response) {
  try {
    const { id } = request.params;
    //finding all product
    const product = await ProductSizeModel.findById(id);
    //check if not found
    if (!product) {
      return response.status(400).json({
        message: "No products found",
        error: true,
        success: false
      })
    }
    return response.status(200).json({
      message: "Products Size found successfully",
      error: false,
      success: true,
      product: product,
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true
    })
  }
}

//this for the homeslider2 50% one image and rest 50% 2 image
//for image upload by cloudanary
var bannerImg = [];
export async function uploadBannerImages(request, response) {
  try {
    const image = request.files;
    const uploadedUrls = [];
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
            uploadedUrls.push(result.secure_url);
            bannerImg.push(result.secure_url); //pushing in banner images
            fs.unlinkSync(`uploads/${request.files[i].filename}`); //Deletes a file synchronously from your local file system  Path to the locally saved file.
            console.log(request.files[i].filename);//uploads folder first load onit and then delete automatic
          }
        }
      );
    }
    return response.status(200).json({
      image: uploadedUrls
    });
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}


//for filter
export async function filter(request, response) {
  //it obtained data from frontend to filter
  const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating, page, limit } = request.body;
  //filter object create and then send this filter
  const filters = {}
  if (catId.length) { //for matching that category id and put category in filters object
    filters.catId = { $in: catId }  //$in is a MongoDB operator that means “match any value from the given array”.
  }
  if (subCatId.length) { //for matching that subcategory id and put category in filters object
    filters.subCatId = { $in: subCatId }
  }
  if (thirdsubCatId.length) { //for matching that category id and put category in filters object
    filters.thirdsubCatId = { $in: thirdsubCatId }
  }
  //for price
  if (minPrice || maxPrice) { //The + converts a string to a number (unary plus).
    filters.price = {};
    if (minPrice) filters.price.$gte = +minPrice;
    if (maxPrice) filters.price.$lte = +maxPrice;
 //$gte means greater than or equal to.
  }
  //for rating
  if (rating.length) { //for matching that category id and put category in filters object
    filters.rating = { $in: rating }
  }
  try {
    const products=await ProductModel.find(filters).populate("category").skip((page-1)*limit).
    limit(parseInt(limit));
    const total=await ProductModel.countDocuments(filters);
    return response.status(200).json({
      error:false,
      success:true,
      products:products,
      total:total,
      page:parseInt(page),
      totalPages:Math.ceil(total/limit)
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}

// const sortItems=(products,sortBy,order)=>{
//   return products.sort((a,b)=>{
//     if(sortBy === 'name'){
//        return order === 'asc' ? a.name.localCompare(b.name) :
//             b.name.localCompare(a.name)
//     }
//     if(sortBy === 'price'){
//       return order === 'asc' ? a.price - b.price : b.price - a.price
//     }
//     return ;
//   })
// }

//sorting the product in filter page
// export async function sortByController(request,response) {
//   try{
//     const {products, sortBy,order}=request.body;
//     const sortedItems= sortItems([...products?.product],sortBy,order);
    
//     return response.status(200).json({
//       error:"false",
//       success:"true",
//       products:sortedItems,
//       page:0,
//       totalPages:0
//     })
//   }
//   catch (error) {
//     console.error(error)
//     return response.status(500).json({
//       message: "Internal Server Error",
//       error: true,
//       success: false
//     })
//   }
// }


const sortItems = (products, sortBy, order) => {
  return products.sort((a, b) => {
    if (sortBy === 'name') {
      return order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    if (sortBy === 'price') {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    }
    // if sortBy is unknown
    return 0;
  });
};

// sorting the product in filter page
export async function sortByController(request, response) {
  try {
    const { products, sortBy, order } = request.body;

    // ✅ products is already an array
    if (!Array.isArray(products)) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Products must be an array",
      });
    }

    const sortedItems = sortItems([...products], sortBy, order);

    return response.status(200).json({
      error: false,
      success: true,
      products: sortedItems,
      page: 0,
      totalPages: 0,
    });
  } catch (error) {
    console.error("Error in sortByController:", error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

//for product searching
export async function searchProductController(request,response) {
  try{
    const {query, page,limit}=request.body;

    if (!query) {
        return response.status(400).json({
          error:true,
          success:false,
          message: "Query is required" 
        });
    }
    const items=await ProductModel.find({
      $or:[
        {name : {$regex : query , $options:"i"}},
        {brand : {$regex : query , $options:"i"}},
        {catName : {$regex : query , $options:"i"}},
        {subCat : {$regex : query , $options:"i"}},
        {thirdsubCat : {$regex : query , $options:"i"}},
      ]
    }).populate("category").skip((page-1)*limit).limit(parseInt(limit))
    const total=await items.length
    return response.status(200).json({
      success:true,
      error:false,
      data:items,
      total:total,
      page:parseInt(page),
      totalPages:Math.ceil(total/limit)
    })
  }
  catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}