import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const registerUser = asyncHandler((req, res) => {

    const { fullName, email, password, phoneNumber, userAddress } = req.body

    if(! (fullName || email || password || phoneNumber || userAddress) ) {
        throw new ApiError(400, "All fields are required")
    }

    const userExist = await User.findOne(
        { email }
    )

    if(userExist){
        throw new ApiError(409, "User with this email already exist")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        phoneNumber,
        userAddress
    })

    if(!user){
        throw new ApiError(500, "Server Error: Unable to register user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User registered successfully")
    )
})

const loginUser = asyncHandler((req, res) => {

    const { email, password } = req.body

    if(!(email || password)){
        throw new ApiError(400, "Email and password both are required")
    }

    const user = await User.findOne( { email })

    if(!user) {
        throw new ApiError(404, "User with this email doesn't exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Password is not correct")
    }

    //generate refresh token and access token
    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    this.refreshToken = newRefreshToken
    await user.save({validateBeforeSave: false})      //jab bhi koi data modify hota hai database me save bus uske liye run hota hai, So save() is not specifically for refresh tokens. It saves all modified fields.
    
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

const logoutUser = asyncHandler((req, res) => {

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

const getCurrentUser = asyncHandler((req, res) => {
    
    const userId = req.user?._id

    const user = await User.findById(userId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User fetched successfully" )
    )

})

