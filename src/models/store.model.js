import mongoose, { Schema } from "mongoose";
import { Review } from "./review.model.js";

const storeSchema = new Schema({

    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    storeName: {
        type: String,
        required: true
    },

    description: {
        type: String,
    },

    address: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    averageRating: {
        type: Number,
        default: 0
    },
}, { timestamps: true })


storeSchema.statics.updateStoreReview = async function (storeId) {

    const result = await Review.aggregate([
        {
            $match: {
                store: new mongoose.Types.ObjectId(storeId)
            }
        },
        {
            $group: {
                _id: "$store",              //foreignField: "localField"
                averageRating: {
                    $avg: "$rating"
                }
            }
        }
    ])

    await this.findByIdAndUpdate(
        storeId,
        {
            averageRating: result.length ? Number(result[0].averageRating.toFixed(1)) : 0
        }
    );
}

export const Store = mongoose.model("Store", storeSchema)