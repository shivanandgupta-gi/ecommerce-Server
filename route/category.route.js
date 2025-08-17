import {Router} from 'express';
import upload from '../middlewares/multer.js';
import { countCategory, createCategory, deleteCategoryController, getAllCategory, getCategoryById, removeImageController, updateCategory, uploadImages } from '../controllers/category.controller.js';
import auth from '../middlewares/auth.js';

const categoryRouter=Router();
//post is used to add new data
//put is used tp update existing data
categoryRouter.post("/imageupload",auth, upload.array("images"),  uploadImages);
categoryRouter.post("/create",auth,   createCategory);
categoryRouter.get("/getcategory",getAllCategory);
categoryRouter.get("/get/countCat",countCategory);
categoryRouter.get("/get/countSubCat",countCategory);
categoryRouter.get("/:id",getCategoryById);
categoryRouter.delete("/delete-image",auth, removeImageController)
categoryRouter.delete("/:id",auth, deleteCategoryController)
categoryRouter.put("/:id",auth, updateCategory)


export default categoryRouter;