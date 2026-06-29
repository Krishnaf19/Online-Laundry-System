import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        phoneNumber: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["USER", "PROVIDER", "ADMIN"],
            default: "USER"
        },

        userAddress: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)



export const User = mongoose.model("User", userSchema)
