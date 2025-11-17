import express, { Response } from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { randomUUID } from 'crypto';
const router = express.Router();

// Create a new game (waiting)
router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  const id = randomUUID();
  const emptyBoard = '---------'; // 9 chars
  await db.query(`
    INSERT INTO games (id, player_x, player_o, status, board)
    VALUES ($1, $2, NULL, 'waiting', $3)
  `, [id, req.user!.id, emptyBoard]);
  res.json({ id });
});

// Join a game (as O)
router.post('/join/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const gameId = req.params.id;
  const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
  if (!rows.length) return res.status(404).json({ error: 'Game not found' });
  const game = rows[0];
  if (game.player_o) return res.status(400).json({ error: 'Game full' });
  await db.query('UPDATE games SET player_o=$1, status=\'playing\' WHERE id=$2', [req.user!.id, gameId]);
  res.json({ ok: true });
});

// List waiting games
router.get('/waiting', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query('SELECT id, player_x, status FROM games WHERE status=$1', ['waiting']);
  res.json(rows);
});

// Get game state
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

export default router;
