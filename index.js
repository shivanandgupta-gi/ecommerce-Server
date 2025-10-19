// Import core modules
import express from 'express';                   // Middleware to enable Cross-Origin Resource Sharing
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



// Create Express app
const app = express();



const PORT = process.env.PORT || 5000;
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://mydukan1.netlify.app",
    "https://mydukan1.netlify.app/"
  ];

  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("X-Debug-Origin", origin || "none");

  if (req.method === "OPTIONS") {
     console.log("✅ Preflight handled for:", origin, req.path);
    return res.sendStatus(200).end();
  }
  next();
});

// 2️⃣ THEN body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// 3️⃣ THEN security and logging
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));

// 4️⃣ Routes (after everything)
app.get("/", (req, res) => {
  res.json({ message: "Server running on port " + PORT });
});

app.use("/api/user", userRoutes);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRouter);
app.use("/api/myList", myListRoute);
app.use("/api/address", addressRouter);
app.use("/api/slide", sliderRoute);
app.use("/api/blog", blogRoute);
app.use("/api/banner", bannerRouterV1);
app.use("/api/order", orderRouter);

// 5️⃣ Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});

// 6️⃣ DB connection and listen
connectDB().then(() => {
  app.listen(PORT, () => console.log("✅ Server running on port", PORT));
});
