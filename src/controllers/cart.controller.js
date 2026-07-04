import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import { Cart } from "../models/cart.model.js"
import { Product } from "../models/product.model.js"



const getUserCart = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId");
    }

    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: "store",
            select: "storeName description address phoneNumber averageRating avatar"
        })
        .populate({
            path: "items.product",
            select: "itemName category price description avatar"
        });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    let totalPrice = 0;
    let totalQuantity = 0;

    cart.items.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
        totalQuantity += item.quantity;
    });

    return res.status(200).json(
        new ApiResponse(200,
            {
                user: cart.user,
                store: cart.store,
                items: cart.items,
                totalPrice,
                totalQuantity
            },
            "Cart fetched successfully"
        )
    );
});


const addItem = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId");
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (!product.isAvailable) {
        throw new ApiError(400, "Currently the service is unavailable");
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    if (!cart.store) {
        cart.store = product.store;
    }

    // Prevent adding products from another store
    if (cart.store.toString() !== product.store.toString()) {
        throw new ApiError(400, "You can only add products from one store")
    }

    const item = cart.items.find(
        item => item.product.toString() === productId
    );

    if (item) {
        item.quantity += 1;
    } else {
        cart.items.push({
            product: productId,
            quantity: 1
        });
    }

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart updated successfully")
    );
});


const removeItem = asyncHandler(async (req, res) => {

    const { productId } = req.params

    if (!isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid productId")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const item = cart.items.find(
        item => item.product.toString() === productId
    );

    if (!item) {
        throw new ApiError(404, "Product not found in cart")
    }

    cart.items.pull(item._id)

    if (cart.items.length === 0) {
        cart.store = null;
    }

    await cart.save()

    return res.status(200).json(
        new ApiResponse(200, cart, "Item removed successfully")
    )
})


const increaseQuantity = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const item = cart.items.find(
        item => item.product.toString() === productId
    );

    if (!item) {
        throw new ApiError(404, "Product not found in cart")
    }

    if (item.quantity >= 10) {
        throw new ApiError(400, "Maximum quantity allowed is 10")
    }

    item.quantity++

    await cart.save()

    return res.status(200).json(
        new ApiResponse(200, cart, "Quantity increased successfully")
    );

})


const decreaseQuantity = asyncHandler(async (req, res) => {

    const { productId } = req.params

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(
        item => item.product.toString() === productId
    );

    if (!item) {
        throw new ApiError(404, "Product not found in cart");
    }

    if (item.quantity <= 1) {
        throw new ApiError(400, "Minimum quantity allowed is 1");
    }

    item.quantity--;

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, cart, "Quantity Decreased successfully")
    );
})


const clearCart = asyncHandler(async (req, res) => {

    const cart = await Cart.findOneAndUpdate(
        {
            user: req.user?._id
        },
        {
            $set: {
                items: [],
                store: null
            }
        },
        {
            new: true
        }
    )

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }



    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Cart clear successfully")
        )
})



export {
    getUserCart,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart
}
