import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectToDatabase = async () => {

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Mongodb connection successful, ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Mongodb connection failed!", error);
        process.exit(1)
    }
}

export default connectToDatabase 