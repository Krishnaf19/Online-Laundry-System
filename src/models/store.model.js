import mongoose, { Schema } from "mongoose";

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

export const Store = mongoose.model("Store", storeSchema)