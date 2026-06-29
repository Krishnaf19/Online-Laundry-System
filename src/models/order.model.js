import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },

    product: [{
        type: mongoose.Types.ObjectId,
        ref: "Product"
    }],

    status: {
        type: String,
        enum: ["PENDING", "DELIVERED", "SHIPPED"],
        required: true
    }
}, { timestamps: true })

export const Order = mongoose.model("Order", orderSchema)