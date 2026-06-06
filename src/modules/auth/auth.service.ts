import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcryptjs"

class AuthService{
  async createUserIntoDB(payload: IUser) {
    // console.log({payload});
    const { name, email, password, role } = payload;
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await pool.query(`
      INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING id, name, email, role, created_at, updated_at
      `, [name, email, hashedPassword, role]);
    return res.rows[0];
  }

  async validateUserFromDB(payload: { email: string, password: string }) {
    const {email, password:givenPassword } = payload;
    const res = await pool.query(`
     SELECT * FROM users WHERE email=$1 
      `, [email]);
    if (res.rowCount === 0) {
      return null;
    }
    const { password, ...user } = res.rows[0];
    const isMatch = await bcrypt.compare(givenPassword, password);
    return isMatch ? user : null;

  }
}

export default new AuthService();