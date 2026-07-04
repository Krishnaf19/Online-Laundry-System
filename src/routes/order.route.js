import { Router } from "express";
import { createOrder, updateOrderStatus, getOrderById, getUserOrder, getStoreOrder} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/").post(authorizeRoles("user"), createOrder)

router.route("/my-orders").get(authorizeRoles("user"), getUserOrder)

router.route("/store-orders").get(authorizeRoles("vendor"), getStoreOrder)

router.route("/:orderId").get(authorizeRoles("vendor"), getOrderById)

router.route("/:orderId/status").patch(authorizeRoles("vendor"), updateOrderStatus)

export default router;