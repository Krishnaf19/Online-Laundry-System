import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getUserOrder = asyncHandler(async (req, res) => {
    
    const { userId } = req.user?._id

})

const getOrderById = asyncHandler(async (req, res) => {
    
}) 

const cancelOrder = asyncHandler(async (req, res) => {
    
})

const updateOrderDetails = asyncHandler(async (req, res) => {
    
})