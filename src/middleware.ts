import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(403).json({
            message: "No token provided"
        });
    }

    // Header looks like: "Bearer tokenvalue"
    const token = header.split(" ")[1];

    if (!token) {
        return res.status(403).json({
            message: "Invalid token format"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};
