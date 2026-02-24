import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authMiddleware(req, res, next) {
    let token = req.header("Authorization");

    if (token) {
        token = token.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                req.user = null;
            } else {
                req.user = decoded;
            }
        });
    } else {
        req.user = null;
    }

    next();
}