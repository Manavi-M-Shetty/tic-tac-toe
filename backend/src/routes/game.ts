import express, { Response } from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { randomUUID } from 'crypto';
const router = express.Router();

// Helper: generate a short 6-char alphanumeric game code
function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new game (waiting)
router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  const id = randomUUID();
  const gameCode = generateGameCode();
  const emptyBoard = '---------'; // 9 chars
  await db.query(`
    INSERT INTO games (id, game_code, player_x, player_o, status, board, current_turn)
    VALUES ($1, $2, $3, NULL, 'waiting', $4, 'X')
  `, [id, gameCode, req.user!.id, emptyBoard]);
  res.json({ id, gameCode });
});

// Join a game by ID (as O)
router.post('/join/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const gameId = req.params.id;
  const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
  if (!rows.length) return res.status(404).json({ error: 'Game not found' });
  const game = rows[0];
  if (game.player_o) return res.status(400).json({ error: 'Game full' });
  if (game.player_x === req.user!.id) return res.status(400).json({ error: 'You already created this game' });
  await db.query('UPDATE games SET player_o=$1, status=\'playing\' WHERE id=$2', [req.user!.id, gameId]);
  res.json({ ok: true });
});

// Join a game by code (as O)
router.post('/join-code/:code', requireAuth, async (req: AuthRequest, res: Response) => {
  const gameCode = req.params.code.toUpperCase();
  const { rows } = await db.query('SELECT * FROM games WHERE game_code=$1', [gameCode]);
  if (!rows.length) return res.status(404).json({ error: 'Game code not found' });
  const game = rows[0];
  if (game.player_o) return res.status(400).json({ error: 'Game full' });
  if (game.player_x === req.user!.id) return res.status(400).json({ error: 'You already created this game' });
  await db.query('UPDATE games SET player_o=$1, status=\'playing\' WHERE id=$2', [req.user!.id, game.id]);
  res.json({ id: game.id, ok: true });
});

// List waiting games
router.get('/waiting', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query('SELECT id, game_code, player_x, status FROM games WHERE status=$1', ['waiting']);
  res.json(rows);
});

// Get game state
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const game = rows[0];
  // Include user's role (player_x or player_o) for correct symbol display
  const userRole = game.player_x === req.user!.id ? 'X' : game.player_o === req.user!.id ? 'O' : null;
  res.json({ ...game, userRole });
});

export default router;
