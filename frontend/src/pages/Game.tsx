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
  const [showWinAnimation, setShowWinAnimation] = useState(false);
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
      const newGame = { ...state, userRole };
      setGame(newGame);
      
      // Show win animation
      if (state.status === 'finished' && state.winner) {
        setShowWinAnimation(true);
        setTimeout(() => setShowWinAnimation(false), 3000);
      }
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
      symbol: game.userRole
    };
    socket.emit('make-move', payload);
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading game...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = game.userRole === game.current_turn;
  const isFinished = game.status === 'finished';
  const isWinner = game.winner === game.userRole;
  const isDraw = game.winner === 'draw';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Win Animation Overlay */}
      {showWinAnimation && isFinished && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-9xl mb-4">
              {isDraw ? '🤝' : isWinner ? '🎉' : '😔'}
            </div>
            <h2 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {isDraw ? 'Draw!' : isWinner ? 'You Win!' : 'You Lose!'}
            </h2>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto relative">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-5 h-5 border-3 border-white rounded-full"></div>
                <div className="w-5 h-5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-white transform rotate-45"></div>
                    <div className="w-full h-0.5 bg-white transform -rotate-45 absolute"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tic-Tac-Toe
              </h1>
              <p className="text-sm text-gray-600 font-mono">Code: {game.game_code || game.id?.slice(0,8)}</p>
            </div>
          </div>
          
          <button
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            onClick={exitGame}
          >
            Exit Game
          </button>
        </div>

        {/* Player Info Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg ${
                game.userRole === 'X' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                  : game.userRole === 'O'
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {game.userRole || '👁️'}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">You are playing as</p>
                <p className="text-3xl font-extrabold text-gray-800">
                  {game.userRole || 'Spectator'}
                </p>
              </div>
            </div>
            
            {/* Turn Indicator */}
            <div className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
              isMyTurn && !isFinished
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {isFinished ? '🏁 Game Over' : isMyTurn ? '✨ Your Turn!' : '⏳ Opponent\'s Turn'}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 mb-6">
          <div className="flex justify-center">
            <div className="inline-grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner">
              {game.board.split('').map((cell: string, idx: number) => {
                const isDisabled = cell !== '-' || isFinished || !isMyTurn;
                const cellValue = cell === '-' ? '' : cell;
                
                return (
                  <button 
                    key={idx} 
                    onClick={() => makeMove(idx)} 
                    disabled={isDisabled}
                    className={`
                      w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl sm:text-6xl font-extrabold
                      flex items-center justify-center
                      transition-all duration-200 transform
                      ${isDisabled ? 'cursor-not-allowed' : 'hover:scale-110 active:scale-95 cursor-pointer'}
                      ${cellValue === 'X' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
                        : cellValue === 'O'
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                        : 'bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 shadow-md hover:shadow-xl'
                      }
                      ${!isDisabled && cellValue === '' ? 'border-2 border-dashed border-gray-300' : ''}
                    `}
                  >
                    {cellValue}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Game Status Cards */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span>📊</span>
            <span>Game Status</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <span className="text-gray-700 font-semibold">Current Turn:</span>
              <span className={`text-2xl font-extrabold ${
                game.current_turn === 'X' ? 'text-blue-600' : 'text-red-600'
              }`}>
                {game.current_turn}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <span className="text-gray-700 font-semibold">Game Status:</span>
              <span className="text-lg font-bold text-purple-600 capitalize">
                {game.status}
              </span>
            </div>
            
            {isFinished && (
              <div className={`p-6 rounded-xl text-center ${
                isDraw 
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300'
                  : isWinner
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300'
                  : 'bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300'
              }`}>
                <div className="text-5xl mb-2">
                  {isDraw ? '🤝' : isWinner ? '🎉' : '😔'}
                </div>
                <p className="text-2xl font-extrabold mb-1">
                  {isDraw ? 'It\'s a Draw!' : isWinner ? 'You Won!' : 'You Lost!'}
                </p>
                <p className="text-lg font-semibold text-gray-700">
                  {isDraw ? 'Well played both!' : `${game.winner} wins the game!`}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}