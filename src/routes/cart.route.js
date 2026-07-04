import { Router } from "express";
import { getUserCart, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart } from "../controllers/cart.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { authorizeRoles } from "../middleware/role.middleware.js"

const router = Router();

router.use(verifyJWT, authorizeRoles("user"))

router.route("/").get(getUserCart)

router.route("/add/:productId").post(addItem)

router.route("/remove/:productId").delete(removeItem)

router.route("/increase/:productId").patch(increaseQuantity)

router.route("/decrease/:productId").patch(decreaseQuantity)

router.route("/clear").delete(clearCart)

export default router;