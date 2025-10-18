import mongoose from "mongoose";
import auth from '../middlewares/auth.js';
import { Router } from "express";
import { addToCartItem, deleteCartItem, emptyCartController, getCartItem, updateCartItemQut } from "../controllers/cart.controller.js";

const cartRouter=Router();

cartRouter.post("/create",auth,addToCartItem);
cartRouter.get("/get",auth,getCartItem);
cartRouter.put("/updateQty",auth,updateCartItemQut);
cartRouter.delete("/delete/:id",auth,deleteCartItem);
cartRouter.delete("/empty/:id",auth,emptyCartController); 

export default cartRouter;