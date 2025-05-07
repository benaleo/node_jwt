import express from "express"
import cors from "cors"
import { sequelize } from "./models/index.js"
import authRoutes from "./routes/auth.js"
import apiRoutes from "./routes/api.js"
import swaggerSetup from "./swagger.js"
import cookieParser from "cookie-parser"


const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


// Routes
app.use("/auth", authRoutes)
app.use("/api", apiRoutes)

// Swagger setup - this will be protected in the swagger.js file
swaggerSetup(app)

// Connect to MySQL and start server
sequelize
    .sync()
    .then(() => {
        console.log("Connected to MySQL database")
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error("MySQL connection error:", err)
    })

app.use((req, res, next) => {
    console.log('Request cookies:', req.cookies);
    next();
});


export default app
