import { Pool } from "pg";
import { config } from "../config";

export const pool = new Pool({
  connectionString: config.database_url
})

export const initDB = async () => {
  try {
    await pool.query(`
     CREATE TABLE IF NOT EXISTS users(
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     role VARCHAR(15) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     ) 
      `);
   
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(15) NOT NULL DEFAULT 'open' CHECK (status IN('open','in_progress', 'resolved')),
      reporter_id INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      CONSTRAINT check_description_length CHECK (LENGTH(description) >= 20)
      )
      `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
}

