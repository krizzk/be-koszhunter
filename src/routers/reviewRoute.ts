import express from "express"
import { getAllReviewsByKosId, createReview, replyToReview, deleteReview } from "../controllers/reviewController"
import { verifyAddReview, verifyReplyReview } from "../middleware/reviewValidation"
import { verifyRole, verifyToken } from "../middleware/authorization"

const app = express()
app.use(express.json())

// Society dapat melihat komentar tanpa login, tapi untuk menambah perlu login
app.get(`/kos/:kosId`, getAllReviewsByKosId)

// Society dapat menambahkan komentar
app.post(`/`, [verifyToken, verifyRole(["SOCIETY"]), verifyAddReview], createReview)

// Owner dapat membalas reviews dari society
app.put(`/:id/reply`, [verifyToken, verifyRole(["OWNER"]), verifyReplyReview], replyToReview)

// Society dan Owner dapat menghapus review (society untuk review sendiri, owner untuk review di kos mereka)
app.delete(`/:id`, [verifyToken], deleteReview)

export default app
