import {Router} from 'express'; 
import upload from '../middlewares/multer.js';
import auth from '../middlewares/auth.js';
import { addBlog, deleteBlogController, getAllBlog, getBlogById, updateBlog, uploadImages } from '../controllers/blog.controller.js';

const blogRoute=Router();

blogRoute.post("/imageupload",auth, upload.array("images"),  uploadImages);
blogRoute.post("/create",auth,   addBlog);
blogRoute.get("/getBlog",getAllBlog);
blogRoute.get("/:id",getBlogById);
blogRoute.delete("/:id",auth, deleteBlogController)
blogRoute.put("/:id",auth, updateBlog)

export default blogRoute; 