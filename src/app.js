import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


//route
import userRouter from "./routes/user.route.js"
import storeRoute from "./routes/store.route.js"
import productRoute from "./routes/product.route.js"
import reviewRoute from "./routes/review.route.js"
import cartRoute from "./routes/cart.route.js"
import orderRoute from "./routes/order.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/store", storeRoute)
app.use("/api/v1/product", productRoute)
app.use("/api/v1/reviews", reviewRoute)
app.use("/api/v1/cart", cartRoute)
app.use("/api/v1/order", orderRoute)

export default app