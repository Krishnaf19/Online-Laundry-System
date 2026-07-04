import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { isValidObjectId } from "mongoose"
import { Order } from "../models/order.model.js"
import { Cart } from "../models/cart.model.js"




const createOrder = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "invalid userid")
    }

    const cart = await Cart.findOne({ user: userId })
        .populate({
            path: "items.product",
            select: "itemName, category, price, avatar"
        })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    if (cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty")
    }

    const totalPrice = cart.items.forEach(item => {
        totalPrice += item.product.price * item.quantity;
    });

    const order = await Order.create({
        user: userId,
        items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity
        })),
        totalPrice
    })

    if(!order){
        throw new ApiError(500, "Server Error: Unable to create order")
    }

    cart.items = []
    await cart.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Order Placed successfully")
        )
})


const updateOrderStatus = asyncHandler(async (req, res) => {

    const { orderId } = req.params

    if (!isValidObjectId(orderId)) {
        throw new ApiError(401, "Invalid orderId")
    }

    const order = await Order.findOneAndUpdate(
        {
            _id: orderId
        },
        {
            $set: {
                orderStatus
            }
        },
        {
            new: true
        }
    )

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Order status changed successfully")
        )
})


const getOrderById = asyncHandler(async (req, res) => {

    const { orderId } = req.params

    if (!isValidObjectId(orderId)) {
        throw new ApiError(401, "Invalid orderId")
    }

    const order = await Order.findOne({ _id: orderId })
        .populate({
            path: "items.product",
            select: "itemName, category, price"
        })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Order status changed successfully")
        )
})


const getUserOrder = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId")
    }

    const order = await Order.findOne({ user: userId })
        .populate({
            path: "items.product",
            select: "itemName category price description"
        })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Order Fetched successfully")
        )

})



export {
    createOrder,
    updateOrderStatus,
    getOrderById,
    getUserOrder
}