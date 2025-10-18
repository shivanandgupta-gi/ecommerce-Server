// Import core modules
import express from 'express';         // Web framework for Node.js
import cors from 'cors';               // Middleware to enable Cross-Origin Resource Sharing
import dotenv from 'dotenv';           // Loads environment variables from a .env file
dotenv.config();                       // Initialize dotenv
import cookieParser from 'cookie-parser'; // Parses cookies attached to client requests
import morgan from 'morgan';              // HTTP request logger middleware
import helmet from 'helmet';              // Helps secure Express apps by setting HTTP headers
import connectDB from './config/connectDB.js';
import userRoutes from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import productRoute from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRoute from './route/mylist.route.js';
import { addAddress } from './controllers/address.controller.js';
import addressRouter from './route/address.route.js';
import sliderRoute from './route/homeSliderBanner.js';
import blogRoute from './route/blog.route.js';
import bannerRouterV1 from './route/bannerV1.route.js';
import orderRouter from './route/order.route.js';


// Create an Express application
const app = express();
// app.use(cors({
//     origin: "http://localhost:5173", // frontend URL
//     credentials: true
// }));
//make the crocs dynmaically such that it can use at different port
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("http://localhost")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));



app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies from the request headers
app.use(morgan("dev"));       // Logs HTTP requests to the console
app.use(helmet({         // Secures HTTP headers
    crossOriginResourcePolicy: false
}));

// Basic route handler
app.get("/", (request, response) => {
    response.json({
        message: "Server is running " + process.env.PORT
    });
});

app.use('/api/user',userRoutes);
app.use('/api/category',categoryRouter);
app.use('/api/product' ,productRoute);
app.use('/api/cart' , cartRouter);
app.use('/api/myList', myListRoute);
app.use('/api/address' , addressRouter);
app.use('/api/slide' , sliderRoute);
app.use('/api/blog',blogRoute);
app.use('/api/banner',bannerRouterV1);
app.use('/api/order',orderRouter);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running",process.env.PORT);
    })
})