import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token) {
    res.status(403).json({
      messege: "invalid token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      userId: string;
    };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      messege: "unauthorised",
    });
  }
};
