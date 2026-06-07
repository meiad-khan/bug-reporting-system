import type { Request, Response } from "express";
import issueService from "./issue.service";
import { sendResponse } from "../../utils/sendResponse";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user.id);
    if (!issue) {
       sendResponse(
         res,
         { message: "Invalid token", error: true, errors: "Your token is not valid" },
         401,
       );
    }
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    })
  } catch (error:any) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500,
    );
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
  } catch (error:any) {
     sendResponse(
       res,
       { message: "Something went wrong", error: true, errors: error },
       500,
     );
  }
}

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issueId = Number(id);
    const issue = await issueService.getSingleIssueFromDB(issueId);
    if (!issue) {
      return sendResponse(
        res,
        {
          message: "Issue not found",
          error: true,
          errors: "No issue exists with this ID",
        },
        404,
      );
    }
    sendResponse(res, { message: "Issue retrieved successfully", data: issue });
  } catch (error:any) {
      sendResponse(
        res,
        { message: "Something went wrong", error: true, errors: error },
        500,
      );
  }
} 

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paramId = Number(id);
    const updatedIssue = await issueService.modifyIssue(
      req.body,
      paramId,
    );
    if (!updatedIssue) {
      sendResponse(
        res,
        {
          message: "Issue not found",
          error: true,
          errors: "No issue exists with this ID",
        },
        404,
      );
    }
    sendResponse(res, { message: "Issue updated successfully", data:updatedIssue });
  } catch (error:any) {
    sendResponse(res, { message: "Something went wrong", error: true, errors: error }, 500);
  }
}

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paramId = Number(id);
    const result = await issueService.deleteIssueFromDB(paramId);
    if (!result) {
      return sendResponse(res, { message: "Issue not found", error: true, errors: "No issue exists with this ID" }, 404);
    }
    sendResponse(res, { message: "Issue deleted successfully" });
  } catch (error:any) {
    sendResponse(
      res,
      { message: "Something went wrong", error: true, errors: error },
      500,
    );
  }
}