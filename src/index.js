import connectToDatabase from "./db/index.js"
import app from "./app.js"
import dotenv  from "dotenv"

dotenv.config({
    path: "./.env"
})

connectToDatabase()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at http://localhost:${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongodb connection failed!", error);
    
})