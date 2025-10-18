import {Router} from 'express'; 
import upload from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import { addBanner, deleteBannersController, getAllBanner, getBannerById, removeImageBlogController, updateBanner, uploadImages } from '../controllers/bannerV1.controller.js';

const bannerRouterV1=Router();

bannerRouterV1.post("/imageuploads",auth, upload.array("images"), uploadImages );
bannerRouterV1.post("/create",auth,   addBanner);
bannerRouterV1.get("/getbanner",getAllBanner);
bannerRouterV1.delete("/:id",auth, deleteBannersController)
bannerRouterV1.put("/:id",auth, updateBanner)
bannerRouterV1.get("/:id",auth, getBannerById)
bannerRouterV1.delete("/delete-image",auth, removeImageBlogController)


export default bannerRouterV1;