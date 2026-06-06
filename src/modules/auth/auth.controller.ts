import type { Request, Response } from "express";
import authService from "./auth.service";
import { signToken } from "../../utils/jwt";

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await authService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data:user
    });
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
    }
    const { accesToken:token } = signToken(user);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user
      }
    });
   
  } catch (error) {
    console.log(error);
  }
}