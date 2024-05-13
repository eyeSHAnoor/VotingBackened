const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtAuthMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({ error: "Token is not available" });
        }

        const token = authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userid = decoded.id;
        next();
    } catch (err) {
        console.error("JWT Authentication Error:", err);
        res.status(401).json({ error: "Invalid token" });
    }
}

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET);
}

module.exports = { generateToken, jwtAuthMiddleware };
