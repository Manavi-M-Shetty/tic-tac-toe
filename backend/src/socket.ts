import { Server, Socket } from 'socket.io';
import db from './db';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// helper: win check
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Helper: decode JWT token to get user ID
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

    // join a game room
    socket.on('join-room', async ({ gameId, token }: { gameId: string; token: string }) => {
      socket.join(gameId);
      const userId = getUserIdFromToken(token);
      socket.data.userId = userId;
      const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      if (!rows.length) return;
      const game = rows[0];
      socket.emit('game-state', game);
    });

    // handle move
    socket.on('make-move', async ({ gameId, index, symbol }: { gameId: string; index: number; symbol: string }) => {
      const userId = socket.data.userId;
      
      // load game
      const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      if (!rows.length) return;
      const game = rows[0];
      
      // Verify it's the user's turn (player_x starts first)
      const currentPlayer = game.current_turn === 'X' ? game.player_x : game.player_o;
      if (userId !== currentPlayer) {
        socket.emit('invalid', { reason: `It's not your turn. Current turn: ${game.current_turn}` });
        return;
      }
      
      let board = game.board.split('');
      if (board[index] !== '-') {
        socket.emit('invalid', { reason: 'Cell occupied' });
        return;
      }
      board[index] = symbol; // 'X' or 'O'
      const newBoard = board.join('');
      
      // Determine win/draw
      let winner: string | null = null;
      for (const w of wins) {
        const [a,b,c] = w;
        if (board[a] !== '-' && board[a] === board[b] && board[b] === board[c]) {
          winner = board[a];
          break;
        }
      }
      
      // Determine next turn: alternate based on current turn (NOT on symbol)
      const nextTurn = game.current_turn === 'X' ? 'O' : 'X';
      
      let status = game.status;
      if (winner) {
        status = 'finished';
        await db.query('UPDATE games SET board=$1, status=$2, winner=$3, current_turn=$4 WHERE id=$5', 
          [newBoard, status, winner, nextTurn, gameId]);
      } else if (!board.includes('-')) {
        status = 'finished';
        await db.query('UPDATE games SET board=$1, status=$2, winner=$3, current_turn=$4 WHERE id=$5', 
          [newBoard, status, 'draw', nextTurn, gameId]);
      } else {
        await db.query('UPDATE games SET board=$1, current_turn=$2 WHERE id=$3', [newBoard, nextTurn, gameId]);
      }

      const { rows: newRows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      io.to(gameId).emit('game-state', newRows[0]);
    });
  });

  return io;
}
