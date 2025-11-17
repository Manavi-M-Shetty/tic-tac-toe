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
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const { rows } = await db.query('SELECT id FROM users WHERE username=$1', [username]);
  if (rows.length) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const r = await db.query('INSERT INTO users (username, password_hash) VALUES ($1,$2) RETURNING id, username', [username, hash]);
  const user = r.rows[0];
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string);
  res.json({ token });
});

// login
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  const { rows } = await db.query('SELECT id, username, password_hash FROM users WHERE username=$1', [username]);
  const user = rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET as string);
  res.json({ token });
});

export default router;
