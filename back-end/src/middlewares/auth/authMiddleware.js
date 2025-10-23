const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: "No token . Authorization Denied!" });
        token = token.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;
        jwt.verify(token, jwtSecret, (error, decoded) => {
            if (error) {
                return res.status(401).json({ message: "Token is not valid not verify" });
            }
            req.userId = decoded.id;
            next();
        });
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

module.exports = { verifyToken };
