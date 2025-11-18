import express, { Response } from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { randomUUID } from 'crypto';

const router = express.Router();

/**
 * Helper function to generate a short 6-character alphanumeric game code.
 * This code is shared with other players to join a specific game.
 */
function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * POST /create
 * -------------------------
 * Creates a new game, either public or private.
 * - Request body should include: { isPublic: boolean }
 * - Returns the game ID, the generated game code, and whether it is public.
 *
 * Notes:
 * - The player who creates the game is automatically assigned as player X.
 * - A new board is initialized as empty.
 * - Public games appear in the lobby for others to join.
 */
router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  const rawValue = req.body.isPublic;
  const isPublic = rawValue === true || rawValue === 'true' || rawValue === 1 || rawValue === '1';

  const id = randomUUID();
  const gameCode = generateGameCode();
  const emptyBoard = '---------';

  await db.query(`
    INSERT INTO games (id, game_code, player_x, player_o, status, board, current_turn, is_public)
    VALUES ($1, $2, $3, NULL, 'waiting', $4, 'X', $5)
  `, [id, gameCode, req.user!.id, emptyBoard, isPublic]);

  res.json({ id, gameCode, isPublic });
});

/**
 * POST /join/:id
 * -------------------------
 * Allows a player to join an existing game using its ID.
 *
 * Rules:
 * - The host (player X) can "join" their own game without modifying anything.
 * - If another player already joined as player O, the request is rejected.
 * - Otherwise, the joining player becomes player O, and the game status changes to 'playing'.
 */
router.post('/join/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const gameId = req.params.id;
  const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
  if (!rows.length) return res.status(404).json({ error: 'Game not found' });

  const game = rows[0];

  if (game.player_x === req.user!.id) return res.json({ id: game.id, ok: true });

  if (game.player_o) return res.status(400).json({ error: 'Game full' });

  await db.query(
    'UPDATE games SET player_o=$1, status=\'playing\' WHERE id=$2',
    [req.user!.id, gameId]
  );

  res.json({ id: game.id, ok: true });
});

/**
 * POST /join-code/:code
 * -------------------------
 * Join a game using its unique game code.
 *
 * Rules are the same as /join/:id:
 * - The host can "join" their own game without changes.
 * - If player O slot is taken, request is rejected.
 * - Otherwise, the joining player fills the player O slot and the game starts.
 */
router.post('/join-code/:code', requireAuth, async (req: AuthRequest, res: Response) => {
  const gameCode = req.params.code.toUpperCase();
  const { rows } = await db.query('SELECT * FROM games WHERE game_code=$1', [gameCode]);
  if (!rows.length) return res.status(404).json({ error: 'Game code not found' });

  const game = rows[0];

  if (game.player_x === req.user!.id) return res.json({ id: game.id, ok: true });

  if (game.player_o) return res.status(400).json({ error: 'Game full' });

  await db.query(
    'UPDATE games SET player_o=$1, status=\'playing\' WHERE id=$2',
    [req.user!.id, game.id]
  );

  res.json({ id: game.id, ok: true });
});

/**
 * GET /waiting
 * -------------------------
 * Retrieves a list of all public games that are waiting for a second player.
 *
 * Response:
 * [
 *   { id, gameCode, playerX, isPublic }
 * ]
 *
 * Notes:
 * - Only public games with status 'waiting' are returned.
 * - The data is formatted in camelCase for frontend convenience.
 */
router.get('/waiting', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT id, game_code, player_x, is_public
      FROM games
      WHERE status = 'waiting'
        AND is_public = true
    `);

    const games = result.rows.map(g => ({
      id: g.id,
      gameCode: g.game_code,
      playerX: g.player_x,
      isPublic: g.is_public
    }));

    res.json(games);
  } catch (err) {
    console.error("Failed to fetch waiting games:", err);
    res.status(500).json({ error: 'Failed to fetch waiting games' });
  }
});

/**
 * GET /:id
 * -------------------------
 * Get the current state of a specific game by its ID.
 *
 * Returns:
 * - All game data
 * - The role of the current user ('X' for host, 'O' for joining player)
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });

  const game = rows[0];
  const userRole = game.player_x === req.user!.id ? 'X' : game.player_o === req.user!.id ? 'O' : null;

  res.json({ ...game, userRole });
});

export default router;
