import express from "express"
import { getDashboard, getFavourite } from "../controllers/reportController"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/dashboard`, [verifyToken, verifyRole(["USER", "ADMIN"])], getDashboard)
app.get(`/favorite`, [verifyToken, verifyRole(["USER", "ADMIN"])], getFavourite)

export default app