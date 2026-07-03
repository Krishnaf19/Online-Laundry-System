import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({

    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },

    category: {
        type: String,
        enum: ["Regular", "Ironing", "Dry Cleaning", "Stain", "Footwear", "Household"],
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
    },

    avatar: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    });

export const Product = mongoose.model("Product", productSchema)