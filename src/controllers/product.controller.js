import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Product } from "../models/product.model.js"
import { isValidObjectId } from "mongoose"
import { Store } from "../models/store.model.js"
import { deleteOnCloudinary } from "../utils/cloudinary.js"



const createProduct = asyncHandler(async (req, res) => {

    const { itemName, category, price, description } = req.body

    if (!itemName || !category || !price || !description) {
        throw new ApiError(400, "All fields are required")
    }

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }


    //Find the logged-in user's store
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
        throw new ApiError(404, "Store not found. Please create a store first.");
    }

    const product = await Product.create({
        itemName,
        category,
        price,
        description,
        avatar: avatar?.url,
        store: store?._id
    })

    if (!product) {
        throw new ApiError(500, "Server Error: Unable to create product")
    }

    await product.populate({
        path: "store",
        select: "storeName avatar averageRating"
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, product, "Product created successfully")
        )

})


const updateProductDetails = asyncHandler(async (req, res) => {

    const { productId } = req.params
    const { category, itemName, price, description } = req.body

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    if (!category || !itemName || !price || !description) {
        throw new ApiError(400, "All fields are required")
    }

    const store = await Store.findOne({ owner: req.user?._id })

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    const product = await Product.findOneAndUpdate(
        {
            productId,
            store: store._id
        },
        {
            $set: {
                category,
                itemName,
                price,
                description
            }
        },
        {
            new: true
        }
    )

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, product, "Product updated successfully")
        )

})


const deleteProduct = asyncHandler(async (req, res) => {

    const { productId } = req.params

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    const store = await Store.findOne({ owner: req.user?._id })

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    const product = await Product.findOneAndDelete({
        _id: productId,
        store: store._id
    })

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Product deleted successfully")
        )
})


const getProductById = asyncHandler(async (req, res) => {

    const { productId } = req.params

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    await product.populate({
        path: "store",
        select: "storeNam description address phoneNumber averageRating"
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, product, "Product fetched successfully")
        )
})


const getAllproduct = asyncHandler(async (req, res) => {

    const product = await Product.find({}).populate({
        path: "store",
        select: "storeName, description, address, phoneNumber, averageRating"
    })


    if (products.length === 0) {
        throw new ApiError(404, "No products found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, product, "Product fetched successfully")
        )
})


const toggleIsAvailable = asyncHandler(async (req, res) => {

    const { productId } = req.params

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    const store = await Store.findOne({ owner: req.user?._id })

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            store: store._id
        },
        {
            $set: {
                isAvailable: {
                    $not: "$isAvailable"
                }
            }
        },
        {
            new: true
        }
    )

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isAvailable: product.isAvailable }, "toggle successfully")
        )
})


const updateProductAvatar = asyncHandler(async (req, res) => {

    const { productId } = req.params

    if (!isValidObjectId(productId)) {
        throw new ApiError(401, "Invalid productId")
    }

    const store = await Store.findOne({ owner: req.user?._id })

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    const avatarLocalImage = req.file?.path

    if (!avatarLocalImage) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalImage)

    if (!avatar) {
        throw new ApiError(500, "Error while uploading Avatar on cloudinary")
    }

    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            store: store._id
        },
        {
            $set: {
                avatar: avatar.url
            }
        },

        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar updated successfully"))
})



export {
    createProduct,
    updateProductDetails,
    deleteProduct,
    getProductById,
    getAllproduct,
    updateProductAvatar
}