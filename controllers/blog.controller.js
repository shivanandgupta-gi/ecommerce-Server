import { v2 as cloudinary } from 'cloudinary'
import { error } from "console";
import fs from 'fs';
import blogModel from '../models/blog.model.js';


cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});
var imageArr = [];

// for image upload by cloudinary  
export async function uploadImages(request, response) {
    try {
        const files = request.files;
        let uploadedImages = [];

        for (let i = 0; i < files?.length; i++) {
            const result = await cloudinary.uploader.upload(files[i].path, {
                use_filename: true,
                unique_filename: true,
                overwrite: false,
            });

            // delete local file after upload
            fs.unlinkSync(files[i].path);

            uploadedImages.push(result.secure_url);
            console.log("Uploaded:", files[i].filename);
        }

        return response.status(200).json({
            success: true,
            allImages: imageArr,     // optional: global store
            images: uploadedImages,   // ✅ send array of all uploaded URLs
        });
    } catch (error) {
        console.error("Upload error:", error);
        return response.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

//create blog name , image upload  on above with theri link 
export async function addBlog(request, response) {
    try {
        //for blog name
        let category = new blogModel({
            title: request.body.title,
            images: request.body.images || [],
            description: request.body.description,
        });

        if (!category) {
            response.status(500).json({
                message: "Failed to save blog",
                error: true,
                success: false,
            });
        }
        //save category
        category = await category.save();
        imageArr = []; //after save array will blank
        return response.status(200).json({
            message: "Blog created successfully",
            error: false,
            success: true,
            blogs: category
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

//for all Blog obtained
export async function getAllBlog(request, response) {
    try {
        //pages added (pagination)
        // parseInt() is a built-in JavaScript function that converts a string into an integer.
        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);
        const totalPosts = await blogModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            });
        }

        //const page = 2;  const perPage = 5;
        const blogs = await blogModel.find()
            .skip((page - 1) * perPage)  //skip 5 documents
            .limit(perPage)  //retunn  5 documents
            .exec();
        //check if not found

        if (!blogs) {
            return response.status(400).json({
                message: "blog not found",
                error: true,
                success: false
            })
        }

        //return all blogs
        return response.status(200).json({
            message: "Blogs fetched successfully",
            success: true,
            error: false,
            blogs: blogs,
            totalPages: totalPages,
            page: page
        });
    }
    catch (error) {
        return response.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
        })
    }

}

//get Blog by id  (singel blog)
export async function getBlogById(request, response) {
    try {
        //find by id
        const blog = await blogModel.findById(request.params.id);
        if (!blog) {
            response.status(500).json({
                success: false,
                error: true,
                message: "Blogs not found"
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            blogs: blog
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

// delete blogs
export async function deleteBlogController(request, response) {
    try {
        const category = await blogModel.findById(request.params.id);
        if (!category) {
            return response.status(404).json({
                message: "Blogs not found",
                success: false,
                error: true
            });
        }
        // ✅ delete images safely
        if (category.images && category.images.length > 0) {
            for (let img of category.images) {
                try {
                    const urlArr = img.split("/");
                    const image = urlArr[urlArr.length - 1];
                    const imageName = image.split(".")[0];
                    await cloudinary.uploader.destroy(imageName);
                } catch (err) {
                    console.error("Error deleting image from Cloudinary:", err);
                }
            }
        }
        // ✅ delete main blogs
        await blogModel.findByIdAndDelete(request.params.id);
        return response.status(200).json({ //return success message
            message: "Blog deleted successfully",
            success: true,
            error: false
        });
    } catch (error) {
        console.error("Delete Blog Error:", error);
        return response.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
        });
    }
}

//update the blogs
export async function updateBlog(request, response) {
    try {
        const category = await blogModel.findByIdAndUpdate(
            request.params.id,
            {
                title: request.body.title,
                images: imageArr.length > 0 ? imageArr[0] : request.body.images,
                description: request.body.description
            },
            { new: true }
        )
        if (!category) {
            response.status(404).json({
                message: "Blog not found",
                success: false,
                error: true
            })
        }
        //image null
        imageArr = [];
        response.status(200).json({
            message: "Blog updated successfully",
            success: true,
            error: false,
            blogs: category
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


