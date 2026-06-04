import type { Request, Response } from "express";
import authService from "./auth.service";

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