import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { isValidObjectId } from "mongoose"
import { Review } from "../models/review.model.js"
import { Store } from "../models/store.model.js"



const createReview = asyncHandler(async (req, res) => {

    const { storeId } = req.params
    const { rating, comment } = req.body

    if (!isValidObjectId(storeId)) {
        throw new ApiError(401, "Invalid storeId")
    }

    if (!rating || !comment) {
        throw new ApiError(400, "Both rating and comment are required to create review")
    }

    const store = await Store.findById(storeId)

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    const review = await Review.create({
        user: req.user?._id,
        store: store._id,
        rating,
        comment
    })

    await review.populate({
        path: "user",
        select: "fullName image"
    })

    if (!review) {
        throw new ApiError(500, "Server Error: Unable to create review")
    }

    await store.updateStoreReviews(storeId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, review, "Review created successfully")
        )
})


const updateReview = asyncHandler(async (req, res) => {

    const { reviewId } = req.params
    const { rating, comment } = req.body

    if (!rating || !comment) {
        throw new ApiError(400, "Both rating and comment are required")
    }

    if (!isValidObjectId(reviewId)) {
        throw new ApiError(401, "Invalid reviewId")
    }

    const review = await Review.findById(reviewId)

    if (!review) {
        throw new ApiError(404, "Review not found")
    }

    if (review.user.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only owner can update the field")
    }

    const updatedReview = await Review.findOneAndUpdate(
        {
            _id: reviewId
        },
        {
            $set: {
                rating,
                comment
            }
        },
        {
            new: true
        }
    ).populate({
        path: "user",
        select: "fullName image"
    })

    if (!updatedReview) {
        throw new ApiError(500, "Server Error: Unable to update review")
    }

    await Store.updateStoreReviews(review.store)

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedReview, "Review updated successfully")
        )
})


const deleteReview = asyncHandler(async (req, res) => {

    const { reviewId } = req.params

    if (!isValidObjectId(reviewId)) {
        throw new ApiError(401, "Invalid reviewId")
    }

    const review = await Review.findById(reviewId)

    if (!review) {
        throw new ApiError(404, "Review not found")
    }

    if (review.user.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only owner can delete the field")
    }

    const deleteReview = await Review.findOneAndDelete({ _id: reviewId })

    if (!deleteReview) {
        throw new ApiError(500, "Server Error: Unable to delete review")
    }

    await Store.updateStoreReviews(review.store)
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Review deleted successfully")
        )
})


const getStoreReviews = asyncHandler(async (req, res) => {

    const { storeId } = req.params

    if (!isValidObjectId(storeId)) {
        throw new ApiError(401, "Invalid storeId")
    }

    const store = await Store.findById(storeId)

    if (!store) {
        throw new ApiError(404, "Store not found")
    }

    const storeReviews = await Review.find({ store: store._id })
        .populate({
            path: "user",
            select: "fullName image"
        })
        .populate({
            path: "store",
            select: "storeName description averageRating"
        })

    if (storeReviews.length === 0) {
        throw new ApiError(404, "Reviews not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, storeReviews, "All reviews fetched successfully")
        )
})


export {
    createReview,
    updateReview,
    deleteReview,
    getStoreReviews
}
