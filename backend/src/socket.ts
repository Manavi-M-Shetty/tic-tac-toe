import { Server, Socket } from 'socket.io';
import db from './db';

// helper: win check
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

export default function setupSocket(httpServer: any, allowedOrigin: string) {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigin }
  });

  io.on('connection', (socket: Socket) => {
    console.log('socket connected', socket.id);

    // join a game room
    socket.on('join-room', async ({ gameId, token }: { gameId: string; token: string }) => {
      // NOTE: for simplicity we don't verify token here. In production, verify JWT and ensure user is part of game.
      socket.join(gameId);
      const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      if (!rows.length) return;
      socket.emit('game-state', rows[0]);
    });

    // handle move
    socket.on('make-move', async ({ gameId, index, symbol }: { gameId: string; index: number; symbol: string }) => {
      // load game
      const { rows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      if (!rows.length) return;
      const game = rows[0];
      let board = game.board.split('');
      if (board[index] !== '-') {
        socket.emit('invalid', { reason: 'Cell occupied' });
        return;
      }
      board[index] = symbol; // 'X' or 'O'
      const newBoard = board.join('');
      // determine win/draw
      let winner: string | null = null;
      for (const w of wins) {
        const [a,b,c] = w;
        if (board[a] !== '-' && board[a] === board[b] && board[b] === board[c]) {
          winner = board[a];
          break;
        }
      }
      let status = game.status;
      if (winner) {
        status = 'finished';
        await db.query('UPDATE games SET board=$1, status=$2, winner=$3 WHERE id=$4', [newBoard, status, winner, gameId]);
      } else if (!board.includes('-')) {
        status = 'finished';
        await db.query('UPDATE games SET board=$1, status=$2, winner=$3 WHERE id=$4', [newBoard, status, 'draw', gameId]);
      } else {
        await db.query('UPDATE games SET board=$1 WHERE id=$2', [newBoard, gameId]);
      }

      const { rows: newRows } = await db.query('SELECT * FROM games WHERE id=$1', [gameId]);
      io.to(gameId).emit('game-state', newRows[0]);
    });
  });

  return io;
}
