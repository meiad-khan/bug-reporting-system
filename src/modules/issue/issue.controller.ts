import type { Request, Response } from "express";
import issueService from "./issue.service";
import { sendResponse } from "../../utils/sendResponse";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user.id);
    if (!issue) {
      res.status(401).json({
        success: false,
        message:"Invalid token"
      })
    }
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    })
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const issues = await issueService.getAllIssuesFromDB(req.query);
    return sendResponse(
      res,
      {
        message: "Issues retrived successfully",
        data: issues,
      },
      200,
    );
  } catch (error) {
    console.log(error);
  }
}