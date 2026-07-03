import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
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
            enum: ["user", "vendor", "admin"],
            default: "user"
        },

        userAddress: {
            type: String,
            required: true
        },

        image: {
            type: String
        },

        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {                                  //mongoose middleware

    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10)

})

userSchema.methods.isPasswordCorrect = async function (userPassword) {      //jwt is npm package

    return await bcrypt.compare(userPassword, this.password)

}

userSchema.methods.generateAccessToken = function () {

    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET
        ,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
