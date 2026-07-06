import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    items: [{

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },

        quantity: {
            type: Number,
            default: 1,
            min: 1,
            max: 10
        }
    }],

    store: {
        type: mongoose.Types.ObjectId,
        ref: "Store"
    }
},
    {
        timestamps: true
    });

export const Cart = mongoose.model("Cart", cartSchema);