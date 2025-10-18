import {Router} from 'express';
import upload from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import { countProduct, createProduct, createRAMS, createSize, createWeight, deleteMultipleProduct, deleteProduct, deleteProductRAMS, deleteProductSize, deleteProductWeight, filter, getFeaturedProduct, getProducts, getProductsByCategoryId, getProductsByCategoryName, getProductsByRAMSId, getProductsByRating, getProductsBySizeId, getProductsBySubCategoryId, getProductsBySubCategoryName, getProductsByThirdLevelSubCategoryId, getProductsByWeightId, getProductsRAMS, getProductsSize, getProductsWeight, getSingleProduct, priceFilter, removeImageController, searchProductController, updateProductController, updateProductRAMS, updateProductSize, updateProductWeight, uploadBannerImages, uploadImages } from '../controllers/product.controllers.js';


const productRoute=Router();

productRoute.post('/upload',auth,upload.array("images"),uploadImages);
productRoute.post('/uploadBanner',auth,upload.array("bannerimages"),uploadBannerImages);
productRoute.post("/create",auth,createProduct);
productRoute.get("/getAllProduct",getProducts);
productRoute.get("/getAllProductByCategory/:id",getProductsByCategoryId);
productRoute.get("/getAllProductByCategoryName/:catName",getProductsByCategoryName);
productRoute.get("/getAllProductBySubCategoryId/:id",getProductsBySubCategoryId);
productRoute.get("/getAllProductBysubCategoryName/:subCat",getProductsBySubCategoryName);
productRoute.get("/getAllProductByThirdSubCategoryId/:id",getProductsByThirdLevelSubCategoryId);
productRoute.get("/getAllProductByPrice",priceFilter);
productRoute.get("/getAllProductByRating",getProductsByRating);
productRoute.get("/getAllProductCount",countProduct);
productRoute.get("/getAllFeaturedProduct",getFeaturedProduct);
productRoute.delete("/deleteProduct/:id",auth,deleteProduct);
productRoute.get("/getSingleProduct/:id",getSingleProduct);
productRoute.delete("/deleteImages",auth,removeImageController);
productRoute.put("/updateProduct/:id",auth,updateProductController);
productRoute.delete("/deletemultiple",auth,deleteMultipleProduct);
//for ram
productRoute.post("/productRAMS/create",auth,createRAMS);
productRoute.delete("/productRamsDelete/:id",auth,deleteProductRAMS);
productRoute.put("/updateRAMS/:id",auth,updateProductRAMS);
productRoute.get("/getAllProductRAMS",getProductsRAMS);
productRoute.get("/productRAMSById/:id",getProductsByRAMSId);
//for weight
productRoute.post("/productWeight/create",auth,createWeight);
productRoute.delete("/productWeightDelete/:id",auth,deleteProductWeight);
productRoute.put("/updateWeight/:id",auth,updateProductWeight);
productRoute.get("/getAllProductWeight",getProductsWeight);
productRoute.get("/productWeightById/:id",getProductsByWeightId);
//for size 
productRoute.post("/productSize/create",auth,createSize);
productRoute.delete("/productSizeDelete/:id",auth,deleteProductSize);
productRoute.put("/updateSize/:id",auth,updateProductSize);
productRoute.get("/getAllProductSize",getProductsSize);
productRoute.get("/productSizeById/:id",getProductsBySizeId);

//filters
productRoute.post("/filters",filter)

//searching
productRoute.post("/search",searchProductController)

export default productRoute;
