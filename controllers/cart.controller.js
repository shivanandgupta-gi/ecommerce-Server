import mongoose from "mongoose";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js"


//add to cart controller
export async function addToCartItem(request, response) {
    try {
        const userId=request.userId; //find userid from middleware
        const {productId}=request.body;  //in {} means  extract productId only
        //if product not found

        if(!productId){
             return response.status(500).json({
                message: "product not found",
                success:false,
                error:true
                })
        }
        //to check that item already in cart or not
        const checkItemCart = await CartProductModel.findOne({
            userId: userId,
            productId: productId
        });
        //item already present
        if (checkItemCart) {
            return response.status(400).json({
                message: "Item already in cart"
            });
        }
        //create a new collection
        const cartItem=new CartProductModel({
            quantity:1,
            userId:userId,
            productId:productId
        })
        //save them
        const save=await cartItem.save();
        //update in user model shopping cart table or schema
        const updateCartUser = await UserModel.updateOne(
            { _id: userId },
            {
                $push: {
                shopping_cart: productId
                }
            }
            );
            return response.status(200).json({
                data: save,
                message: "Item add successfully",
                error: false,
                success: true
            });
    } 
    catch(error){
        console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//get cart item controller
export async function getCartItem(request,response) {
    try{
            const userId = request.userId; //get by middleware auth
            //for this populate all product detail
            const cartItem = await CartProductModel.find({ userId: userId }).populate('productId');

            return response.json({
                data: cartItem,
                error: false,
                success: true
            });
    }
    catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//update the quantity item
export async function updateCartItemQut(request,response) {
    try{
        const userId=request.userId; //login user id
        const {_id,qty}=request.body; //id of cart and how much quantity from body
        //if id or qty not found
        if(!_id || !qty){
            return response.status(400).json({
                message:"provide id or qunatity",
                success:false,
                error:true
            })
        }
        //update quantity
        const updateCartitem = await CartProductModel.updateOne(
            { _id: _id, userId: userId },
            { quantity: qty }
        );

            return response.json({
            message: "Update cart",
            success: true,
            error: false,
            data: updateCartitem
            });

    }
    catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//delete the cart item
export async function deleteCartItem(request,response) {
    try{
        const userId=request.userId; //from middleware
        const {_id ,productId}=request.body; //id to delete product id help to delete form shoping cart in usermodel to delete

        if(!_id){
            return response.status(400).json({
                message:"provide the id",
                success:false,
                error:true
            })
        }
        //cart id to delete
        const deleteCartItem = await CartProductModel.deleteOne({
            _id: _id,
            userId: userId
        });

        //find user to delete product id
        const user=await UserModel.findOne({_id:userId})
        const cartItems=user?.shopping_cart; //to get shopping cart detail from user model to delete from theis also
        //delete from shopping cart
        const updatedInterests = [
            ...cartItems.slice(0, cartItems.indexOf(productId)),
            ...cartItems.slice(cartItems.indexOf(productId) + 1)
            ];
            
        user.shopping_cart=updatedInterests; //update again remainging part
        await user.save();
            return response.json({
                message: "Item remove",
                error: false,
                success: true,
                data: deleteCartItem
            });


    }
    catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

