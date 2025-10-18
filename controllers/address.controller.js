import express, { response } from 'express';
import userModel from '../models/user.model.js';
import addressModel from '../models/address.model.js';


//for adding address
export const addAddress = async (request, response) => {
    try {
        //this obtained from the frontend
        const {address_line1,city,state,pincode,country,mobile,select,landmark,addressType}=request.body;
        const userId = request.userId; //from middleware
        //check if all the fields are empty or not;
        //if all these any field empty then return error
        if (!address_line1 || !city || !state || !pincode || !country || !mobile ) {
            return response.status(400).json({
                message: "Please fill all the fields",
                success: false,
                error: true
            });
        }

        //create address object
        const address = new addressModel({
            address_line1,
            city,
            state,
            pincode,
            country,
            mobile,
            userId,
            select,
            landmark,
            addressType
        })
        //save the address
        const saveAddress = await address.save();
        const updateAddressUser=await userModel.updateOne({
            _id:userId
        },{ //pushing the address of the user in the address array of the user detail
            $push:{
                address_details:saveAddress._id
            }
        })
        return response.status(200).json({
            message: "Address added successfully",
            success:true,
            error:false,
            data:saveAddress
        })
    }
      catch(error){
        console.error(error)
      return response.status(500).json({
        message: "Internal Server Error",
        success:false,
        error:true
       })
    }
}

//fetching the address of the user
export const fetchAddress = async (request,response)=>{
    try{
        //findign id of the user  from the query parameter
        const userId = request.query.userId;
        const address = await addressModel.find({userId}); //search the address of the user from the address collection
        //if there is no address found then return 404 error
        if(!address || address.length===0){
            return response.status(404).json( {
                message: "No address found",
                success:false,
                error:true
            })
        }
        return response.status(200).json({
            message: "Address fetched successfully",
            success:true,
            error:false,
            data:address
        })
    }
    catch(error){
        console.error(error)
        return response.status(500).json({
            message: "Internal Server Error",
            success:false,
            error:true
           })
    }
}

export const selectAddressController = async (request, response) => {
  try {
    const userId = request.userId; // from auth middleware ✅
    const addressId = request.params.id; // address id from params ✅

    // Check if address exists and belongs to the user
    const address = await addressModel.findOne({ _id: addressId, userId });

    if (!address) {
      return response.status(404).json({
        message: "Address not found or not valid for this user",
        success: false,
        error: true,
      });
    }

    // First, unselect all previous addresses of this user (if you want only one selected at a time)
    await addressModel.updateMany({ userId }, { $set: { select: false } });

    // Update the selected address
    const updatedAddress = await addressModel.findByIdAndUpdate(
      addressId,
      { select: request.body.select },
      { new: true }
    );

    return response.status(200).json({
      message: "Address updated successfully",
      success: true,
      error: false,
      data: updatedAddress,
    });

  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

//delting the address
export async function deleteAddress(request, response) {
    try {
        const userId = request.userId; //from middleware
        const _id = request.params.id; //id to delete product id help to delete form shoping cart in usermodel to delete

        if (!_id) {
            return response.status(400).json({
                message: "provide the id",
                success: false,
                error: true
            })
        }
        //cart id to delete
        const deleteCartItem = await addressModel.deleteOne({
            _id: _id, //product id
            userId: userId
        }); 

        await userModel.updateOne(
            { _id: userId },
            { $pull: { address_details: _id } }  // remove _id from array
        );


        return response.json({
            message: "Address deleted successfully",
            error: false,
            success: true,
            data: deleteCartItem
        });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: true
        })
    }
}
   