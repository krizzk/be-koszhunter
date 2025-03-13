import express from "express"
import { getAllOrders, createOrder, updateStatusOrder, deleteOrder, getOrderById } from "../controllers/orderController"
import { verifyAddOrder, verifyEditStatus } from "../middlewares/orderValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/allOrders`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getAllOrders)

app.get(`/:id`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getOrderById)

app.post(`/`, [verifyToken, verifyRole(["CASHIER"]), verifyAddOrder], createOrder)
app.put(`/:id`, [verifyToken, verifyRole(["CASHIER"]), verifyEditStatus], updateStatusOrder)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteOrder)

export default app 