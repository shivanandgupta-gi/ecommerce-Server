import mongoose from "mongoose";
import auth from '../middlewares/auth.js';
import { addToCartItem, deleteCartItem, getCartItem, updateCartItemQut } from "../controllers/cart.Controller.js";
import { Router } from "express";

const cartRouter=Router();

cartRouter.post("/create",auth,addToCartItem);
cartRouter.get("/get",auth,getCartItem);
cartRouter.put("/updateQty",auth,updateCartItemQut);
cartRouter.delete("/delete",auth,deleteCartItem);

export default cartRouter;