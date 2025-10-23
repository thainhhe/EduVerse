const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");

const securityMiddleware = (app) => {
    //Thêm các header bảo mật (ngăn clickjacking, sniffing, XSS, v.v.)
    app.use(helmet());
    //Ngăn chặn NoSQL Injection (lọc các ký tự $ và .)
    app.use(mongoSanitize());
    //Làm sạch dữ liệu chống XSS (script injection)
    app.use(xss());
    //Ngăn HTTP Parameter Pollution (tránh trùng key query)
    app.use(hpp());
    //Giới hạn số request (chống DDoS)
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 phút
        max: 100, // Tối đa 100 request / IP / 15 phút
        message: "Too many requests, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
};

module.exports = securityMiddleware;
