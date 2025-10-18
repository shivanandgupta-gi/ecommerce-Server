import mongoose from "mongoose";
import auth from '../middlewares/auth.js';
import { Router } from "express";
import { countOrderController, createOrderController, getOrderDetailAdminController, getOrderDetailController, totalSalesController, totalUserController, updateOrderStatusController } from "../controllers/order.controller.js";

const orderRouter=Router();

orderRouter.post("/create",auth,createOrderController);
orderRouter.get("/get",auth,getOrderDetailController);
orderRouter.get("/getOrder",auth,getOrderDetailAdminController);
orderRouter.put("/order-status/:id",auth,updateOrderStatusController);
orderRouter.get("/orderCount",auth,countOrderController);
orderRouter.get("/sales",auth,totalSalesController);
orderRouter.get("/users",auth,totalUserController);

export default orderRouter;