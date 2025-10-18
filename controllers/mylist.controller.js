import MyListModel from "../models/myList.model.js";

//add to list
export async function addToMyList (request, response) {
  try {
    const userId=request.userId //get from middlware for login user
    const {productId, productTitle, image, rating, price, oldPrice, discount, brand}=request.body;
    //to check that item present in list or not 
    const item=await MyListModel.findOne({
        userId:userId,
        productId:productId
    })
     //check if item is already
    if(item){
        return response.status(400).json({
            message: "Item Already Added in Wishlist",
            success:false,
            error:true
        })
    }
    //if not add to list create collection
    const myList=new MyListModel({
        userId:userId,
        productId:productId,
        productTitle:productTitle,
        image:image,
        rating:rating,
        price:price,
        oldPrice:oldPrice,
        discount:discount,
        brand:brand,
        userId:userId
    })
    //save the item in collection
    const save=await myList.save();

    return response.status(200).json({
        message: "Item Added in Wishlist",
        success:true,
        error:false,
        data:save
    })
  }
  catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//delete from my list
export async function deleteMyListItem(request, response) {
    try{
       //finding id of product to delete from list
       const myListItem=await MyListModel.findById(request.params.id);
       //if not found
       if(!myListItem){
        return response.status(400).json({
          message: "Item Not Found",
          success:false,
          error:true
        })
       }
       //delete the item from collection
       const deleteItem=await MyListModel.findByIdAndDelete(myListItem._id);
       //if item not deleted
       if(!deleteItem){
        return response.status(400).json({
            message: "Item Not Deleted",
            success:false,
            error:true
        })
    }
       return response.status(200).json({
        message: "Item Deleted Successfully",
        success:true,
        error:false,
        data:deleteItem
        })
    }
    catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

//get my list item and print all item in my list
export async function getMyListItem(request, response) {
    try{
        const userId=request.userId; //find id by middleware
        //find by user id
        const myListItem=await MyListModel.find({
            userId:userId
        })
        //if not found user id it means no list
        if(!myListItem){
            return response.status(400).json({
                message: "No List Found",
                success:false,
                error:true
            })
        }
        //if found
        return response.status(200).json({
            message: "List Found",
            success:true,
            error:false,
            data:myListItem
        })
    }
    catch(error){
    return response.status(500).json({
      message: "Internal Server Error",
      success:false,
      error:true
    })
  }
}

