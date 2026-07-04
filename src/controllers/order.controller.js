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
            select: "itemName category price avatar"
        })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    if (cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty")
    }

    let totalPrice = 0;

    cart.items.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
    });

    const order = await Order.create({
        user: userId,
        store: cart.store,
        items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity
        })),
        totalPrice
    })

    if (!order) {
        throw new ApiError(500, "Server Error: Unable to create order")
    }

    cart.items = []
    cart.store = null
    await cart.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Order Placed successfully")
        )
})


const updateOrderStatus = asyncHandler(async (req, res) => {

    const { orderId } = req.params
    const { orderStatus } = req.body

    if (!isValidObjectId(orderId)) {
        throw new ApiError(401, "Invalid orderId")
    }

    const store = await Store.findOne({
        owner: req.user._id
    });

    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            store: store?._id
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


    const order = await Order.findOne(
        {
            _id: orderId,
            user: req.user?._id

        })
        .populate({
            path: "items.product",
            select: "itemName category price"
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

    const orders = await Order.find({ user: userId })
        .populate({
            path: "items.product",
            select: "itemName category price description"
        })

    if (orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "Order Fetched successfully")
        )

})

const getStoreOrder = asyncHandler(async (req, res) => {

    const store = await Store.findOne({
        owner: req.user._id
    });

    if (!store) {
        throw new ApiError(404, "Store not found");
    }

    const orders = await Order.find({
        store: store._id
    })
        .populate({
            path: "user",
            select: "fullName email phoneNumber"
        })
        .populate({
            path: "items.product",
            select: "itemName price category avatar"
        });

    if (orders.length === 0) {
        throw new ApiError(404, "No orders found");
    }

    return res.status(200).json(
        new ApiResponse(200, orders, "Store orders fetched successfully")
    );
});



export {
    createOrder,
    updateOrderStatus,
    getOrderById,
    getUserOrder,
    getStoreOrder
}