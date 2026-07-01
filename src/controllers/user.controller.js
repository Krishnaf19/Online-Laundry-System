import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { isValidObjectId } from "mongoose"

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, password, phoneNumber, userAddress } = req.body

    if (!fullName || !email || !password || !phoneNumber || !userAddress) {
        throw new ApiError(400, "All fields are required")
    }

    const userExist = await User.findOne(
        { email }
    )

    if (userExist) {
        throw new ApiError(409, "User with this email already exist")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        phoneNumber,
        userAddress
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Server Error: Something went wrong while registering the user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email and password both are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User with this email doesn't exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is not correct")
    }

    //generate refresh token and access token
    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    this.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })      //jab bhi koi data modify hota hai database me save bus uske liye run hota hai, So save() is not specifically for refresh tokens. It saves all modified fields.

    const loggedInUser = await User.findById(user?._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {

                user: loggedInUser,
                accessToken: accessToken,
                refreshToken: newRefreshToken

            }, "User login successfully")
        )


})

const logoutUser = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    const loggoutUser = await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logout successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    const user = await User.findById(userId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User fetched successfully")
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken

    if (incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized user")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token expired or not used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    user.refreshToken = newRefreshToken
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
        )

})

const updatePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password updated successfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email, phoneNumber, userAddress } = req.body

    if (!fullName || !email || !phoneNumber || !userAddress) {
        throw new ApiError(400, "Field can't be empty")
    }

    const user = await User.findByIdAndUpdate(
        re.user?._id,
        {
            $set: {
                fullName,
                email,
                phoneNumber,
                userAddress
            }
        },
        {
            new: true
        }
    ).select("-password refreshToken")

    if (!user) {
        throw new ApiResponse(500, "Server Error: Unable to update fields")
    }

    return res
        .status(200)
        .json(
            new ApiError(200, user, "Account updated successfully")
        )
})

//Admin controllers
const getAllUsers = asyncHandler(async (req, res) => {

    const users = await User.find({}).select("-password, refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, users, "Users fetched successfully")
        );

})

const getUserById = asyncHandler(async (req, res) => {

    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId")
    }

    const user = await User.findById(userId).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User fetched successfully")
        )
})

const updateRole = asyncHandler(async (req, res) => {

    const { role } = req.body
    const { userId } = req.params


    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId")
    }

    if (!role) {
        throw new ApiError(400, "Role is required");
    }

    if (!["user", "vendor", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                role
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(500, "Server Error: Unable to update role")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Role updated successfully")
        )

})

const deleteUser = asyncHandler(async (req, res) => {

    const { userId } = req.params


    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId")
    }

    const user = await User.findOneAndDelete(userId)

    if (!user) {
        throw new ApiError(500, "Server Error: Unable to delete role")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "User deleted successfully")
        )
})




export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updatePassword,
    updateAccountDetails,
    getAllUsers,
    getUserById,
    updateRole,
    deleteUser
}