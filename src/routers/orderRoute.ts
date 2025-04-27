import express from "express"
import { createOrder, updateStatusOrder, deleteOrder, getOrderById } from "../controllers/orderController"
import { verifyAddOrder, verifyEditStatus } from "../middlewares/orderValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

// app.get(`/allOrders`, [verifyToken, verifyRole(["CASHIER", "ADMIN"])], getAllOrders)

app.get(`/:id`, [verifyToken, verifyRole(["ADMIN"])], getOrderById)

app.post(`/`, [verifyToken, verifyRole(["CASHIER"]), verifyAddOrder], createOrder)
app.put(`/:id`, [verifyToken, verifyRole(["CASHIER"]), verifyEditStatus], updateStatusOrder)
app.delete(`/:id`, [verifyToken, verifyRole(["ADMIN"])], deleteOrder)

export default app 