import { Router } from "express"
import { createReview, updateReview, deleteReview, getStoreReviews } from "../controllers/review.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js"

const router = Router();

router.use(verifyJWT)

router.route("/store/:storeId").get(getStoreReviews)

router.route("/store/:storeId").post(authorizeRoles("user"), createReview)

router.route("/:reviewId").patch(authorizeRoles("user"), updateReview)

router.route("/:reviewId").delete(authorizeRoles("user"), deleteReview)

export default router;