import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:4000';

function getToken() { return localStorage.getItem('token') || ''; }
function getUserId() { return Number(localStorage.getItem('uid')) || null; }

export default function Game(){
  const { id } = useParams();
  const nav = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);
  const userId = getUserId();

  function exitGame() {
    socket?.disconnect();
    nav('/lobby');
  }

  useEffect(() => {
    const s = io(API_BASE);
    setSocket(s);
    s.on('connect', () => console.log('socket connected'));
    s.on('game-state', (state: any) => {
      // Compute user role on frontend
      const userRole = state.player_x === userId ? 'X' : state.player_o === userId ? 'O' : null;
      setGame({ ...state, userRole });
    });
    s.on('invalid', (i: any) => alert(i.reason));
    if (id) {
      s.emit('join-room', { gameId: id, token: getToken() });
    }
    return () => { s.disconnect(); };
  }, [id, userId]);

  const makeMove = (i: number) => {
    if (!game || !game.userRole) {
      alert('You are not part of this game');
      return;
    }
    if (game.current_turn !== game.userRole) {
      alert(`It's not your turn. Current turn: ${game.current_turn}`);
      return;
    }
    const payload = {
      gameId: id,
      index: i,
      symbol: game.userRole // Use userRole computed on frontend
    };
    socket.emit('make-move', payload);
  };

  if (!game) return <div className="text-center py-4">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Game: <span className="font-mono text-lg">{game.game_code || game.id.slice(0,8)}</span></h2>
      <p className="mb-4 text-lg">You are playing as: <strong className="text-2xl text-blue-600">{game.userRole || 'Spectator'}</strong></p>
      <div className="grid grid-cols-3 gap-2 max-w-xs mb-6">
        {game.board.split('').map((cell: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => makeMove(idx)} 
            className="w-20 h-20 border-2 rounded text-4xl font-bold flex items-center justify-center bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cell !== '-' || game.status === 'finished' || game.current_turn !== game.userRole}
          >
            {cell === '-' ? '' : cell}
          </button>
        ))}
      </div>
      <div className="border-t pt-4">
        <div className="mb-2">
          <strong>Current Turn:</strong> <span className="text-lg font-bold text-blue-600">{game.current_turn}</span>
          {game.userRole === game.current_turn ? ' (Your turn!)' : ' (Opponent\'s turn)'}
        </div>
        <div className="mb-2">
          <strong>Status:</strong> <span className="capitalize">{game.status}</span>
        </div>
        {game.winner && (
          <div className="mb-2 text-lg font-bold text-green-600">
            {game.winner === 'draw' ? '🎲 Draw!' : `🎉 ${game.winner} wins!`}
          </div>
        )}
        <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700" onClick={exitGame}>Exit Game</button>
      </div>
    </div>
  );
}
