import mongoose from "mongoose";
import auth from '../middlewares/auth.js';
import { Router } from "express";
import { addAddress, deleteAddress, fetchAddress, selectAddressController } from "../controllers/address.controller.js";


const addressRouter=Router();

addressRouter.post('/add',auth,addAddress);
addressRouter.get('/get',auth,fetchAddress);
addressRouter.put('/update/:id',auth, selectAddressController)
addressRouter.delete('/delete/:id',auth, deleteAddress)


export default addressRouter;