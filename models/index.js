// In models/index.js
import { Sequelize } from "sequelize"
import UserModel from "./User.js"
import dotenv from 'dotenv'

dotenv.config()

// Database configuration
const DB_NAME = process.env.DB_NAME || "your_db_name"
const DB_USER = process.env.DB_USER || "your_db_user"
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_HOST = process.env.DB_HOST || "localhost"

// Initialize Sequelize with your database
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: "mysql",
    logging: false
})

// Initialize models
const User = UserModel(sequelize)

// Setup model associations if needed
// Example: User.hasMany(Post)

export { sequelize, User }