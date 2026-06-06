import type { Request, Response } from "express";
import authService from "./auth.service";
import { signToken } from "../../utils/jwt";
import { sendResponse } from "../../utils/sendResponse";


export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.createUserIntoDB(req.body);
    sendResponse(res, { message: "User registered successfully",data:user },201);
  } catch (error:any) {
     sendResponse(
       res,
       { message: "Something went wrong", error: true, errors: error },
       500,
     );
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.validateUserFromDB(req.body);
    if (!user) {
      return sendResponse(res, { message: "Wrong password or email",error:true,errors:"Invalid credential" }, 404);
    }
    const { id, name, role } = user;
    const { accesToken:token } = signToken({id, name, role});
    sendResponse(res, {
      message: "Login successful", data: {
        token,
        user
    }})
   
  } catch (error:any) {
     sendResponse(
       res,
       { message: "Something went wrong", error: true, errors: error },
       500,
     );
  }
}