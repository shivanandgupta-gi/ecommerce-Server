import { request, response } from "express";
import OrderModel from "../models/order.model.js"
import ProductModel from "../models/product.model.js";
import userModel from "../models/user.model.js";

export const createOrderController= async(request,response) => {
    try{
        let order= new OrderModel({
            userId:request.body.userId,
            products:request.body.products,
            paymentId:request.body.paymentId,
            payment_status:request.body.payment_status,
            delivery_address:request.body.delivery_address,
            totalAmt:request.body.totalAmt,
            date:request.body.date,
        });
        if(!order){ //if order not found
            response.status(500).json({
                error:true,
                success:false,
                message:"no order"
            })
        }
        for(let i=0;i<request.body.products.length;i++){
            await ProductModel.findByIdAndUpdate( //dencrese the count in stock 
                request.body.products[i].productId,
                {
                    countInStock:parseInt(request.body.products[i].countInStock-request.body.products[i].quantity),
                },
                {new:true}
            );
        }
        order=await order.save(); //save the order
        return response.status(200).json({
            error:false,
            success:true,
            message:"order placed",
            order:order
        })
    }
    catch (error) {
    console.error(error)
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false
    })
  }
}

//this for fetch the order 
export const getOrderDetailController = async (request, response) => {
  try {
    const userId = request.userId;

    const orderlist = await OrderModel.find({ userId })
      .sort({ createdAt: -1 }) // ✅ sort before await
      .populate("delivery_address")
      .populate("userId"); // if you want user details too

    return response.status(200).json({
      error: false,
      success: true,
      message: "order list",
      order: orderlist,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

//this for fetch the order 
export const getOrderDetailAdminController = async (request, response) => {
  try {
    const userId = request.userId;

    const orderlist = await OrderModel.find() //admin see all user order
      .sort({ createdAt: -1 }) // ✅ sort before await
      .populate("delivery_address")
      .populate("userId"); // if you want user details too

    return response.status(200).json({
      error: false,
      success: true,
      message: "order list",
      order: orderlist,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

//this for the oreder status changing(updating order status)
export const updateOrderStatusController=async(request,response)=>{
  try{
    const {id, order_status}=request.body;
    
    const updateOrderStatus=await OrderModel.updateOne({
      _id:id,
    },
    {
      order_status:order_status
    },{
      new:true
    }
  ) 
  return response.status(200).json({
    error:false,
    success:true,
    message:"Updated Order Status"
  })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

//for all order fetch
export const countOrderController=async (request,response)=>{
  try{
    const ondercount=await OrderModel.countDocuments();
    return response.status(200).json({
      error:false,
      success:true,
      order:ondercount
    })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

//for the total sales
export const totalSalesController=async (request,response)=>{
  try{
      const currentYear = new Date().getFullYear();
      const ordersList = await OrderModel.find();

      let totalSales = 0;
      let monthlySales = [
        { name: 'JAN', TotalSales: 0 },
        { name: 'FEB', TotalSales: 0 },
        { name: 'MAR', TotalSales: 0 },
        { name: 'APR', TotalSales: 0 },
        { name: 'MAY', TotalSales: 0 },
        { name: 'JUN', TotalSales: 0 },
        { name: 'JUL', TotalSales: 0 },
        { name: 'AUG', TotalSales: 0 },
        { name: 'SEP', TotalSales: 0 },
        { name: 'OCT', TotalSales: 0 },
        { name: 'NOV', TotalSales: 0 },
        { name: 'DEC', TotalSales: 0 }
      ];
      
      //fetching the data from the current year
      for (let i = 0; i < ordersList.length; i++) {
        totalSales += parseInt(ordersList[i].totalAmt); 
        const str = JSON.stringify(ordersList[i].createdAt); //2024-10-14 like that date stored
        const year = str.substr(1, 4); //2024
        const monthStr = str.substr(6, 8); //10
        const month = parseInt(monthStr.substr(0, 2)); //14

        if (currentYear == year) {
          if (month >= 1 && month <= 12) {
            monthlySales[month - 1] = {
              name: monthlySales[month - 1].name,
              TotalSales: monthlySales[month - 1].TotalSales + parseInt(ordersList[i].totalAmt)
            };
          }
        }
      }
      return response.status(200).json({
        success:true,
        error:false,
        totalSales:totalSales,
        monthlySales:monthlySales
      })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

//for the total user
export const totalUserController=async (request,response)=>{
  try{
    const users = await userModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);
    let monthlyUsers = [
        { name: 'JAN', TotalUsers: 0 },
        { name: 'FEB', TotalUsers: 0 },
        { name: 'MAR', TotalUsers: 0 },
        { name: 'APR', TotalUsers: 0 },
        { name: 'MAY', TotalUsers: 0 },
        { name: 'JUN', TotalUsers: 0 },
        { name: 'JUL', TotalUsers: 0 },
        { name: 'AUG', TotalUsers: 0 },
        { name: 'SEP', TotalUsers: 0 },
        { name: 'OCT', TotalUsers: 0 },
        { name: 'NOV', TotalUsers: 0 },
        { name: 'DEC', TotalUsers: 0 }
      ];
       //fetching the data from the current year
      for (let i = 0; i < users.length; i++) {
          if (users[i]?._id?.month === 1) {
            monthlyUsers[0] = {
              name:"JAN",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 2) {
            monthlyUsers[1] = {
              name:"FAB",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 3) {
            monthlyUsers[2] = {
              name:"MAR",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 4) {
            monthlyUsers[3] = {
              name:"APR",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 5) {
            monthlyUsers[4] = {
              name:"MAY",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 6) {
            monthlyUsers[5] = {
              name:"JUN",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 7) {
            monthlyUsers[6] = {
              name:"JUL",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 8) {
            monthlyUsers[7] = {
              name:"AUG",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 9) {
            monthlyUsers[8] = {
              name:"SEP",
              TotalUsers:users[i].count
            }
          }

          if (users[i]?._id?.month === 10) {
            monthlyUsers[9] = {
              name:"OCT",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 11) {
            monthlyUsers[10] = {
              name:"NOV",
              TotalUsers:users[i].count
            }
          }
          if (users[i]?._id?.month === 12) {
            monthlyUsers[11] = {
              name:"DEC",
              TotalUsers:users[i].count
            }
          }

      }
       return response.status(200).json({
        success:true,
        error:false,
        TotalUsers:monthlyUsers
      })
  }
  catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
}



