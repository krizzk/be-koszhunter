import express from "express"
import { createOrder, updateStatusOrder, deleteOrder, getOrderById, getAllOrders } from "../controllers/orderController"
import { verifyAddOrder, verifyEditStatus } from "../middlewares/orderValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/allOrders`, [verifyToken, verifyRole(["USER", "ADMIN"])], getAllOrders)

app.get(`/:id`, [verifyToken, verifyRole(["ADMIN"])], getOrderById)

app.post(`/`, [verifyToken, verifyRole(["USER"]), verifyAddOrder], createOrder)
app.put(`/:id`, [verifyToken, verifyRole(["ADMIN","USER"]), verifyEditStatus], updateStatusOrder)
app.delete(`/:id`, [verifyToken, verifyRole(["ADMIN"])], deleteOrder)

export default app 