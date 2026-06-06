import jwt from "jsonwebtoken";
import type { IUser } from "../modules/auth/auth.interface";
import { config } from "../config";
import type { Role } from "../types";

export const signToken = (payload: { id: number; name: string; role: Role }) => {
  const accesToken = jwt.sign(payload, config.jwt_secret as string, {
    expiresIn: "1d",
  });
  return { accesToken };
};