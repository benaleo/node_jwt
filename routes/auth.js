// In routes/auth.js
import express from "express"
import bcrypt from "bcrypt"
import { generateToken } from "../middleware/auth.js"
import { sequelize } from "../models/index.js"
import dotenv from "dotenv"

const router = express.Router()
dotenv.config()

// Get the User model from sequelize models
// This approach works if your models are defined in sequelize
const User = sequelize.models.User

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateToken(user);

        // If login is for accessing Swagger UI, set cookie and redirect
        if (req.body.redirect === "swagger") {
            console.log('Setting token cookie:', token.substring(0, 10) + '...');

            // Set token cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                path: '/',
                sameSite: 'lax'
            });

            // Redirect to API docs
            return res.redirect('/api-docs');
        }

        // Normal API response with token
        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

// Register route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user" // Default role
        })

        // Generate token
        const token = generateToken(user)

        // If registration is for accessing Swagger UI, redirect there
        if (req.body.redirect === "swagger") {
            // Return token in cookie for Swagger UI access
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
            return res.redirect("/api-docs")
        }

        // Normal API response with token
        res.status(201).json({
            message: "Registration successful",
            token
        })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({ message: "An error occurred during registration" })
    }
})

// Logout
router.get("/logout", (req, res) => {
    // Clear the token cookie
    res.clearCookie("token", {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    // Check if the request is from Swagger UI
    const referer = req.headers.referer || "";
    if (referer.includes("api-docs")) {
        // Redirect back to API docs (which will show login form)
        return res.redirect("/api-docs");
    }

    // For API clients
    res.status(200).json({ message: "Logged out successfully" });
});


export default router