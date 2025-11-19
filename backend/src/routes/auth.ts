/**
 * Authentication Routes
 * ----------------------
 * This file handles user registration and login for the Tic-Tac-Toe application.
 * It provides two main endpoints:
 * 
 *   POST /register  – Creates a new user account
 *   POST /login     – Authenticates an existing user
 *
 * Both routes interact with the PostgreSQL database and return a JWT token
 * that the frontend can store and use for authenticated requests.
 *
 * Technologies used:
 *  - Express.js for routing
 *  - PostgreSQL for database storage
 *  - bcrypt for secure password hashing
 *  - jsonwebtoken for generating access tokens
 *
 * Notes:
 *  - Passwords are never stored in plain text. They are hashed before saving.
 *  - Tokens include the user ID and username.
 *  - All errors return clear messages so the frontend can show helpful alerts.
 */

import express, { Response } from 'express';
import db from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest } from '../middleware/auth';
dotenv.config();
const router = express.Router();

// register
router.post('/register', async (req: AuthRequest, res: Response) => {
  /**
   * POST /api/auth/register
   * ------------------------
   * Registers a new user.
   *
   * Request body:
   *  - username (string)
   *  - password (string)
   *
   * Steps:
   *  1. Validate input
   *  2. Check if username already exists
   *  3. Hash the password securely
   *  4. Store the new user in the database
   *  5. Return a signed JWT token
   */
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const { rows } = await db.query('SELECT id FROM users WHERE username=$1', [username]);
  if (rows.length) return res.status(400).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 10);

  const r = await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1,$2) RETURNING id, username',
    [username, hash]
  );

  const user = r.rows[0];
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string);
  res.json({ token });
});

// login
router.post('/login', async (req: AuthRequest, res: Response) => {
  /**
   * POST /api/auth/login
   * ---------------------
   * Logs in an existing user.
   *
   * Request body:
   *  - username (string)
   *  - password (string)
   *
   * Steps:
   *  1. Check if username exists
   *  2. Verify password using bcrypt
   *  3. If valid, return a JWT token
   */
  const { username, password } = req.body;

  const { rows } = await db.query(
    'SELECT id, username, password_hash FROM users WHERE username=$1',
    [username]
  );

  const user = rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string);
  res.json({ token });
});

export default router;
