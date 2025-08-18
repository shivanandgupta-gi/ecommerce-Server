import {Router} from 'express';
import upload from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import { countProduct, createProduct, deleteProduct, getFeaturedProduct, getProducts, getProductsByCategoryId, getProductsByCategoryName, getProductsByRating, getProductsBySubCategoryId, getProductsBySubCategoryName, getSingleProduct, priceFilter, removeImageController, updateProductController, uploadImages } from '../controllers/product.controllers.js';


const productRoute=Router();

productRoute.post('/upload',auth,upload.array("images"),uploadImages);
productRoute.post("/create",auth,createProduct);
productRoute.get("/getAllProduct",getProducts);
productRoute.get("/getAllProductByCategory/:id",getProductsByCategoryId);
productRoute.get("/getAllProductByCategoryName/:catName",getProductsByCategoryName);
productRoute.get("/getAllProductBySubCategoryId/:id",getProductsBySubCategoryId);
productRoute.get("/getAllProductBysubCategoryName/:subCat",getProductsBySubCategoryName);
productRoute.get("/getAllProductByPrice",priceFilter);
productRoute.get("/getAllProductByRating",getProductsByRating);
productRoute.get("/getAllProductCount",countProduct);
productRoute.get("/getAllFeaturedProduct",getFeaturedProduct);
productRoute.delete("/deleteProduct/:id",auth,deleteProduct);
productRoute.get("/getSingleProduct/:id",getSingleProduct);
productRoute.delete("/deleteImages",auth,removeImageController);
productRoute.put("/updateProduct/:id",auth,updateProductController);

export default productRoute;
