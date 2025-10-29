import {Router} from 'express'; 
import upload from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import { addBanner, deleteBannersController, getAllBanner, getBannerById, removeImageBlogController, uploadImages } from '../controllers/ads.controller.js';

const adsRouter=Router();

adsRouter.post("/imageuploads",auth, upload.array("images"), uploadImages );
adsRouter.post("/create",auth,   addBanner);
adsRouter.get("/getbanner",getAllBanner);
adsRouter.delete("/:id",auth, deleteBannersController)
adsRouter.get("/:id",auth, getBannerById)
adsRouter.delete("/delete-image",auth, removeImageBlogController)


export default adsRouter;