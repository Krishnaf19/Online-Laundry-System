import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";


const authorizeRoles = (...roles) => {                                              // make a function and return a function
    return asyncHandler(async (req, res, next) => {
        
        if(!req.user){
            throw new ApiError(401, "Unauthorized acces")
        }

        if(!roles.includes(req.user?.role)){                                  //Include: checks whether an array contains a specific value.
            throw new ApiError(403, "This role is not allowed to acces the resource")
        }

        next()
    })
}

export { authorizeRoles }