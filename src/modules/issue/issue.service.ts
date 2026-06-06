import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

class IssueService{
  async createIssue(payload: IIssue, rep_id: number) {
    const {title, description, type, status } = payload;
    const res = await pool.query(`
      INSERT INTO issues(title, description, type, status, reporter_id)
      VALUES($1, $2, $3, COALESCE($4, 'open'), $5) RETURNING *
      `, [title, description, type, status, rep_id]);
    return res.rows[0];
  }
}

export default new IssueService();