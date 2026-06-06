import jwt from "jsonwebtoken";
import type { IUser } from "../modules/auth/auth.interface";
import { config } from "../config";

export const signToken = (payload: IUser & {id: number}) => {
  const accesToken = jwt.sign(payload, config.jwt_secret as string, {
    expiresIn: "1d"
  });
  return {accesToken}
}