import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import type { IUser } from "../modules/auth/auth.interface";
import type { Role } from "../types";
import { sendResponse } from "../utils/sendResponse";

export const auth = (...roles : Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse(
          res,
          {
            message: "Token isn't found",
            error: true,
            errors: "Authorization token is missing in request headers",
          },
          401,
        );
      }
      const decoded = jwt.verify(
        token as string,
        config.jwt_secret as string,
      ) as JwtPayload & { id: number } & IUser;

      

      if (!roles.includes(decoded?.role)) {
        return sendResponse(
          res,
          {
            message: "Forbidden - you don't have permission",
            error: true,
            errors: "User role is not allowed to access this resource",
          },
          401,
        );
      }      
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return sendResponse(
          res,
          {
            message: "Invalid token",
            error: true,
            errors: "JWT signature is invalid or token is malformed",
          },
          401,
        );
      }

      if (error instanceof jwt.TokenExpiredError) {
        return sendResponse(
          res,
          {
            message: "Token expired",
            error: true,
            errors: "JWT token has expired, please login again",
          },
          401,
        );
      }
      next(error);
    }
  }
}