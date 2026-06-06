import { title } from "node:process";
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

  async getAllIssuesFromDB(query:any) {
    const { sort = "newest", type, status } = query;

    let sql = `SELECT * FROM issues`;
    let conditions = [];
    let values = [];

    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    if (sort === "oldest") {
      sql += ` ORDER BY created_at ASC`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    const issues = await pool.query(sql, values);

    const reporterIds = issues.rows.map(issue => issue.reporter_id);
    const users = await pool.query(`
      SELECT id, name, role FROM users
      WHERE id=ANY($1)
      `, [reporterIds]);
    const issueFormat = issues.rows.map(issue => {
      const reporter = users.rows.find(user => user.id === issue.reporter_id);
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: {
          id: reporter?.id,
          name: reporter?.name,
          role:reporter?.role,
        },
        created_at: issue.created_at,
        updated_at:issue.updated_at,
      }
    })

    return issueFormat;
  }
}

export default new IssueService();