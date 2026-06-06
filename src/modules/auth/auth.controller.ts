import type { Request, Response } from "express";
import authService from "./auth.service";
import { signToken } from "../../utils/jwt";
import { sendResponse } from "../../utils/sendResponse";


export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.createUserIntoDB(req.body);
    sendResponse(res, { message: "User registered successfully",data:user },201);
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.validateUserFromDB(req.body);
    if (!user) {
      res.status(404).json({
        success: false,
        message:"Invalid password or email"
      })
      return sendResponse(res, { message: "Invalid password or email" }, 404);
    }
    const { accesToken:token } = signToken(user);
    sendResponse(res, {
      message: "Login successful", data: {
        token,
        user
    }})
   
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message:error.message
    })
  }
}