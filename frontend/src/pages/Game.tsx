import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:4000';

function getToken() { return localStorage.getItem('token') || ''; }

export default function Game(){
  const { id } = useParams();
  const [game, setGame] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const s = io(API_BASE);
    setSocket(s);
    s.on('connect', () => console.log('socket connected'));
    s.on('game-state', (state: any) => setGame(state));
    s.on('invalid', (i: any) => alert(i.reason));
    if (id) {
      s.emit('join-room', { gameId: id, token: getToken() });
    }
    return () => { s.disconnect(); };
  }, [id]);

  const makeMove = (i: number) => {
    if (!game) return;
    // decide symbol: player_x is X, player_o is O. we let server/room decide in production.
    // For simplicity, we let user choose symbol based on user id equality.
    // in production verify via server — here just send X/O depending if you are player_x
    const payload = {
      gameId: id,
      index: i,
      symbol: game.player_x === Number(localStorage.getItem('uid')) ? 'X' : 'O' // NOTE: store uid on login ideally
    };
    socket.emit('make-move', payload);
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Game: {game.id}</h2>
      <div className="grid grid-cols-3 gap-2 max-w-xs">
        {game.board.split('').map((cell: string, idx: number) => (
          <button key={idx} onClick={() => makeMove(idx)} className="w-20 h-20 border rounded text-3xl flex items-center justify-center bg-white">
            {cell === '-' ? '' : cell}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <div>Status: {game.status}</div>
        <div>Winner: {game.winner ?? '—'}</div>
      </div>
    </div>
  );
}
