import jwt from "jsonwebtoken";
/* ------------------------------------ 1 ----------------------------------- */
// 1. Check token ada atau tidak
// 2. Validasi token yang ada
export function verifyToken(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.status(401).json({ message: "Unauthorized: Token not found" });
        return;
    }
    try {
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
        if (!payload) {
            res.status(401).json({ message: "Token verification failed" });
            return;
        }
        // Optional: kamu bisa validasi `provider` kalau mau
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
}
/* ------------------------------------ 2 ----------------------------------- */
export function roleGuard(...roles) {
    return async function (req, res, next) {
        const user = req.user;
        if (roles.includes(user.role)) {
            next();
            return;
        }
        res.status(403).json({ message: "Unauthorized access" });
    };
}
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "No token provided." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    }
    catch (err) {
        console.error("Token verification error:", err);
        res.status(401).json({ message: "Invalid token." });
    }
}
