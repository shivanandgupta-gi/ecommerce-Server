import mongoose from "mongoose";
import auth from '../middlewares/auth.js';
import { Router } from "express";
import { addToMyList, deleteMyListItem, getMyListItem } from "../controllers/mylist.controller.js";

const myListRoute=Router();


myListRoute.post("/add",auth, addToMyList);
myListRoute.delete("/delete/:id" , auth,deleteMyListItem);
myListRoute.get("/get",auth,getMyListItem);

export default myListRoute;