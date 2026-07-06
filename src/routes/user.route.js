import { Router } from "express"
import { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, updatePassword, updateAccountDetails, updateImage, getAllUsers, getUserById, updateRole, deleteUser } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middlerware.js"
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js"

const router = Router()

router.route("/register").post(upload.single("image"), registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-password").patch(verifyJWT, updatePassword)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/update-image").patch(verifyJWT, upload.single("image"), updateImage)


// Admin Routes

router.route("/admin/users").get(verifyJWT, authorizeRoles("admin"), getAllUsers)

router.route("/admin/users/:userId").get(verifyJWT, authorizeRoles("admin"), getUserById)

router.route("/admin/users/:userId/role").patch(verifyJWT, authorizeRoles("admin"), updateRole)

router.route("/admin/users/:userId").delete(verifyJWT, authorizeRoles("admin"), deleteUser)

export default router;