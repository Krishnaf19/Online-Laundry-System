import { Router } from "express"
import { createStore, updateStore, deleteStore, getStoreById, getAllStore, getStoresProduct } from "../controllers/store.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js"

const router = Router()

router .use(verifyJWT)

router.route("/").get(getAllStore)

router.route("/:storeId").get(getStoreById)

router.route("/:storeId/products").get(getStoresProduct)

router.route("/").post(authorizeRoles("vendor"), createStore)

router.route("/").patch(authorizeRoles("vendor"), updateStore)

router.route("/:storeId").delete(authorizeRoles("vendor"), deleteStore)

export default router;