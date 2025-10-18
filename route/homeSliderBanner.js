import {Router} from 'express';
import upload from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import { addHomeSlider, deleteSlide, getAllSlider, getSliderById, removeImageController, updateSlide, uploadBannerImage } from '../controllers/homeSliderBanner.js';

const sliderRoute=Router();

sliderRoute.post("/imageupload",auth, upload.array("images"),  uploadBannerImage);
sliderRoute.post("/create",auth,  addHomeSlider);
sliderRoute.get("/getSlide",getAllSlider);
sliderRoute.get("/:id",getSliderById);
sliderRoute.delete("/delete-image",auth, removeImageController)
sliderRoute.delete("/:id",auth, deleteSlide)
sliderRoute.put("/:id",auth, updateSlide)


export default sliderRoute; 