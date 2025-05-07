import express from "express"
import { verifyToken } from "../middleware/auth.js"
import bcrypt from "bcrypt";
import User from "../models/user.js";

const router = express.Router()

// Protected route - requires authentication
router.use(verifyToken)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authentication Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Logged in user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Protected profile route
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       401:
 *         description: Wrong Email or Password
 */
router.post("/auth/login", (req, res) => {
    const {email, password} = req.body;
    res.json({
        message: "Protected profile route",
        user: req.user,
        email,
        password,
    });
})


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User Registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *       400:
 *         description: Bad request
 */
router.post("/auth/register", async (req, res) => {
    const {name, email, password} = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        // Check if user already exists
        const existingUser = await User.findOne({where: {email}}); // Assuming Sequelize is used and User model is defined
        if (existingUser) {
            return res.status(400).json({message: "Email is already registered"});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to the database
        const newUser = await User.create({name, email, password: hashedPassword}); // Replace `User.create` with the appropriate code for user creation in your database setup

        // Sending a response with the new user data
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Something went wrong"});
    }
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", (req, res) => {
    res.json({
        message: "Protected profile route",
        user: req.user,
    })
})

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Get protected data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protected data
 *       401:
 *         description: Unauthorized
 */
router.get("/data", (req, res) => {
    res.json({
        message: "Protected data route",
        data: {
            items: [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
                { id: 3, name: "Item 3" },
            ],
        },
    })
})

export default router
