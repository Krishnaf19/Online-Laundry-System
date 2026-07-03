import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },

    orderStatus: {
        type: String,
        enum: ["Pending", "Delivered", "Canceled", "Shipped", "Reached Laundry"],
        default: "Pending"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    }

}, { timestamps: true })

export const Order = mongoose.model("Order", orderSchema)