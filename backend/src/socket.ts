/**
 * Socket.IO Real-Time Game Logic (socket.ts)
 * ------------------------------------------
 * This file sets up the WebSocket layer for the Tic-Tac-Toe game.
 * Unlike regular HTTP requests, Socket.IO keeps a persistent connection
 * between the server and the client, allowing players to:
 *
 *    • join a game room
 *    • make moves in real time
 *    • receive instant board updates
 *
 * The server validates each move, updates the database, and broadcasts
 * the latest game state to both players.
 *
 * Key Features:
 * -------------
 * 1. **JWT Authentication**
 *    Each socket connection provides a token. This file includes a helper
 *    function to extract the user ID from that token. Unauthorized or invalid
 *    tokens simply result in a null user ID.
 *
 * 2. **Room-Based Communication**
 *    Each game uses its own room (identified by the gameId).
 *    When a player joins a room, they immediately receive the current
 *    game state from the database.
 *
 * 3. **Move Validation**
 *    For each move:
 *      - The server checks if it's that user's turn.
 *      - Ensures the chosen cell is not already filled.
 *      - Updates the board, checks for a win/draw, and stores everything
 *        in the PostgreSQL database.
 *
 * 4. **Win/Draw Logic**
 *    A simple `wins` array lists all 8 winning combinations.
 *    After each move, the server compares the board against these patterns.
 *
 * 5. **Real-Time Broadcasting**
 *    After updating the game, the server retrieves the latest row from
 *    the database and emits the `game-state` event to everyone in that room.
 *
 * Parameters:
 * -----------
 * @param httpServer  The Express HTTP server instance
 * @param allowedOrigins  CORS-allowed frontend URLs
 *
 * Returns:
 * --------
 * The configured Socket.IO server instance.
 */

import { Server, Socket } from 'socket.io';
import db from './db';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Winning combinations for a standard 3×3 Tic-Tac-Toe board
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/**
 * Extract the user ID from a JWT token.
 * Returns null if the token is invalid or expired.
 */
function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return decoded.id;
  } catch {
    return null;
  }
}

export default function setupSocket(httpServer: any, allowedOrigins: string[]) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('socket connected', socket.id);

    /**
     * join-room
     * ----------
     * Sent when a user opens a game page.
     * The server joins them to the game room and immediately
     * responds with the current stored game state.
     */
    socket.on('join-room', async ({ gameId, token }) => {
      socket.join(gameId);

      const userId = getUserIdFromToken(token);
      socket.data.userId = userId;

      const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      if (!rows.length) return;

      socket.emit('game-state', rows[0]);
    });

    /**
     * make-move
     * ----------
     * Fired when a player clicks a board cell.
     *
     * The server:
     *   - checks if it is the correct player's turn
     *   - validates the move
     *   - updates the game board
     *   - evaluates win/draw
     *   - notifies both players of the updated state
     */
    socket.on('make-move', async ({ gameId, index, symbol }) => {
      const userId = socket.data.userId;

      // Load current game data
      const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      if (!rows.length) return;

      const game = rows[0];

      // Determine whose turn it is
      const currentPlayer = game.current_turn === 'X' ? game.player_x : game.player_o;

      // Reject incorrect turn
      if (userId !== currentPlayer) {
        socket.emit('invalid', { reason: `It's not your turn. Current turn: ${game.current_turn}` });
        return;
      }

      // Process move
      let board = game.board.split('');
      if (board[index] !== '-') {
        socket.emit('invalid', { reason: 'Cell occupied' });
        return;
      }

      board[index] = symbol;
      const newBoard = board.join('');

      // Check for win or draw
      let winner: string | null = null;
      for (const w of wins) {
        const [a, b, c] = w;
        if (board[a] !== '-' && board[a] === board[b] && board[b] === board[c]) {
          winner = board[a];
          break;
        }
      }

      const nextTurn = game.current_turn === 'X' ? 'O' : 'X';
      let status = game.status;

      if (winner) {
        status = 'finished';
        await db.query(
          'UPDATE games SET board=$1, status=$2, winner=$3, current_turn=$4 WHERE id=$5',
          [newBoard, status, winner, nextTurn, gameId]
        );
      } else if (!board.includes('-')) {
        status = 'finished';
        await db.query(
          'UPDATE games SET board=$1, status=$2, winner=$3, current_turn=$4 WHERE id=$5',
          [newBoard, status, 'draw', nextTurn, gameId]
        );
      } else {
        await db.query(
          'UPDATE games SET board=$1, current_turn=$2 WHERE id=$3',
          [newBoard, nextTurn, gameId]
        );
      }

      // Broadcast updated state to both players
      const { rows: updated } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      io.to(gameId).emit('game-state', updated[0]);
    });
  });

  return io;
}
