import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1d" },
    )
}

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid token." })
    }
}

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        res.status(403).json({ message: "Access denied. Admin privileges required." })
    }
}
