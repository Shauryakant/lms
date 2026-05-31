import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Unauthorized request" });
      return;
    }

    const decodedToken: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      res.status(401).json({ message: "Invalid Access Token" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Access Token", error });
  }
};
