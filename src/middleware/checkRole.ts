import type { NextFunction, Request, Response } from "express";
import { pool } from "../db";
import { sendResponse } from "../utils/sendResponse";

export const checkRole = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM issues WHERE id=$1
      `, [id]);
    const issue = result.rows[0];
  const user = req.user;
  if (user.role === "maintainer" || (user.role === "contributor" && user.id === issue.reporter_id && issue.status === "open")) {
    return next();
  }
  return sendResponse(
    res,
    {
      message: "Forbidden",
      error: true,
      errors: "You do not have permission to access this resource",
    },
    403,
  );
   
}