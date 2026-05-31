import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Admin has access to all modules
    if (req.user.role === "Admin") {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: `Forbidden. Requires one of roles: ${roles.join(", ")}` });
      return;
    }

    next();
  };
};
