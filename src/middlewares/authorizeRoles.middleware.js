import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const authorizeRoles = (...roles) => {                                         //make a function and return a function
    
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied");
        }
        next()
    }
}

export { authorizeRoles }