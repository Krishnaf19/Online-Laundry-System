import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { isValidObjectId } from "mongoose"
import { Store } from "../models/store.model.js"
import { Product } from "../models/product.model.js"



const createStore = asyncHandler(async (req, res) => {

    const { storeName, description, address, phoneNumber } = req.body

    if (!storeName || !description || !address || !phoneNumber) {
        throw new ApiError(400, "All field are required")
    }

    const alreadyExist = await Store.findOne({ storeName })

    if (alreadyExist) {
        throw new ApiError(409, "Store already exist")
    }

    const store = await Store.create({
        storeName,
        description,
        address,
        phoneNumber,
        owner: req.user?._id
    })

    if (!store) {
        throw new ApiError(500, "Server Error: Unable to create store")
    }

    await store.populate({
        path: "owner",
        select: "fullName email avatar"
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, store, "Store created successfully")
        )

})


const updateStore = asyncHandler(async (req, res) => {

    const { storeName, description, address, phoneNumber } = req.body

    if (!storeName || !description || !address || !phoneNumber) {
        throw new ApiError(400, "All field are required")
    }

    const store = await Store.findOneAndUpdate(
        {
            owner: req.user?._id
        },
        {
            $set: {
                storeName,
                description,
                address,
                phoneNumber
            }
        },
        {
            new: true
        }
    )

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    await store.populate({
        path: "owner",
        select: "fullName email avatar"
    });


    return res
        .status(200)
        .json(
            new ApiResponse(200, store, "Store updated successfully")
        )

})


const deleteStore = asyncHandler(async (req, res) => {

    const { storeId } = req.params

    if (!isValidObjectId(storeId)) {
        throw new ApiError(401, "Invalid storeId")
    }

    const store = await Store.findOneAndDelete({
        _id: storeId,
        owner: req.user._id
    });

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Store deleted successfully")
        )
})


const getStoreById = asyncHandler(async (req, res) => {

    const { storeId } = req.params

    if (!isValidObjectId(storeId)) {
        throw new ApiError(401, "Invalid storeId")
    }

    const store = await Store.findById(storeId)

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    await store.populate({
        path: "owner",
        select: "fullName image"
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, store, "Store fetched successfully")
        )
})


const getAllStore = asyncHandler(async (req, res) => {

    const store = await Store.find({})

    if (store.length === 0) {
        throw new ApiError(404, "No store is made")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, store, "All stores are fetched successfully")
        )
})


const getStoresProduct = asyncHandler(async (req, res) => {

    const { storeId } = req.params

    if (!isValidObjectId(storeId)) {
        throw new ApiError(401, "Invalid storeId")
    }

    const products = await Product.find({ store: storeId })

    if (products.length === 0) {
        throw new ApiError(404, "No products belong to this store")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, products, "All products of the store are fetched successfully")
        )
})



export {
    createStore,
    updateStore,
    deleteStore,
    getStoreById,
    getAllStore,
    getStoresProduct
}