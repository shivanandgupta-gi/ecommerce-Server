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

// Create an Express application
const app = express();
app.use(cors());
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

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running",process.env.PORT);
    })
})