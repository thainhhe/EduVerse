const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json({ message: "No token . Authorization Denied!" });
    token = token.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) {
        return res
          .status(401)
          .json({ message: "Token is not valid not verify" });
      }
      req.userId = decoded.id;
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: err.toString() });
  }
};

const checkLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;
    jwt.verify(token, jwtSecret, (error, decoded) => {
      if (error) {
        req.user = null;
        return next();
      }
      req.user = { _id: decoded.id };
      req.userId = decoded.id;
      return next();
    });
  } catch (err) {
    req.user = null;
    return next();
  }
};

module.exports = { verifyToken, checkLogin };
