import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({

    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },

    category: {
        type: String,
        enum: ["REGULAR", "IRONING", "DRY CLEANING", "STAIN", "FOOTWEAR", "HOUSEHOLD"],
        required: true
    },

    itemName: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
    },

    isAvailable: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    });

export const Product = mongoose.model("Product", productSchema)