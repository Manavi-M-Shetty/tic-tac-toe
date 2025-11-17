import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon often needs SSL; if local PG remove this
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params)
};
