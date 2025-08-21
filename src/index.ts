import express from "express"
import cors from "cors"
import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"

import KosRoute from "./routers/kosRoute"
import RoomRoute from "./routers/roomRoute"
import UserRoute from "./routers/userRoute"
import BookingRoute from "./routers/bookingRoute"
import ReviewRoute from "./routers/reviewRoute"
import FacilityRoute from "./routers/facilityRoute"

import { PORT } from "./global"

const app = express()
app.use(cors())
app.use(express.json())

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "KoSz Hunter API",
      version: "1.0.0",
      description: "API documentation for the Kos Hunter system - A boarding house rental platform",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routers/*.ts"], // Path to the API docs
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// API Routes
app.use(`/kos`, KosRoute)
app.use(`/rooms`, RoomRoute)
app.use(`/users`, UserRoute) //include dahsboard
app.use(`/bookings`, BookingRoute) // includdes Invoice dan history 
app.use(`/reviews`, ReviewRoute)
app.use(`/facilities`, FacilityRoute)

app.use("/uploads", express.static(path.join(__dirname, "..", "public")))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Kos Hunter API is running",
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint not found",
  })
})

app.listen(PORT, () => {
  console.log(`[server]: Kos Hunter API is running at http://localhost:${PORT}`)
  console.log(`[docs]: API Documentation available at http://localhost:${PORT}/api-docs`)
})
