import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getUserCart = asyncHandler(async (req, res) => {
    
    const { userId } = req.user?._id

})

const addItem = asyncHandler(async (req, res) => {
    
})

const removeItem = asyncHandler(async (req, res) => {
    
})