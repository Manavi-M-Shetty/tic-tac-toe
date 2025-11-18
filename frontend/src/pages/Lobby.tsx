import { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function getToken() {
  return localStorage.getItem('token') || '';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('uid');
}

export default function Lobby() {
  const [waiting, setWaiting] = useState<any[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const nav = useNavigate();

  // Show success/error messages
  function showMessage(text: string, type: 'success' | 'error') {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: null }), 5000);
  }

  // Fetch public waiting games
  useEffect(() => {
    fetchWaiting();
  }, []);

  async function fetchWaiting() {
    setIsLoading(true);
    try {
      const r = await API.get('/game/waiting', { 
        headers: { Authorization: 'Bearer ' + getToken() } 
      });
      
      setWaiting(r.data);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to fetch waiting games.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  // Create new game
  async function createGame(isPublic: boolean) {
    setShowCreateDialog(false);
    
    try {
      const r = await API.post(
        "/game/create",
        { isPublic },
        { headers: { Authorization: "Bearer " + getToken() } }
      );

      showMessage(
        isPublic
          ? `Public game created! Code: ${r.data.gameCode}. Redirecting...`
          : `Private game created! Code: ${r.data.gameCode}. Share this code.`,
        "success"
      );

      nav(`/game/${r.data.id}`);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || "Failed to create game", "error");
    }
  }

  // Join a public game
  async function joinGame(id: string) {
    try {
      await API.post(`/game/join/${id}`, {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      nav(`/game/${id}`);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to join game', 'error');
    }
  }

  // Join private game by code
  async function joinByCode() {
    if (!codeInput.trim()) {
      showMessage('Please enter a game code.', 'error');
      return;
    }
    try {
      const r = await API.post(`/game/join-code/${codeInput}`, {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      setCodeInput('');
      nav(`/game/${r.data.id}`);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to join game with code', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              {/* Game icon */}
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
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Game Lobby
              </h1>
              <p className="text-gray-600 text-sm mt-1">Find opponents and start playing!</p>
            </div>
          </div>
          
          <button
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            onClick={() => { logout(); nav('/'); }}
          >
            Logout
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`p-4 rounded-xl font-medium text-center mb-6 shadow-lg transform transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-2 border-red-200'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Action Buttons Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg"
              onClick={() => setShowCreateDialog(true)}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">+</span>
                <span>Create New Game</span>
              </div>
            </button>
            <button
              className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg hover:border-indigo-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
              onClick={fetchWaiting}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">↻</span>
                  <span>Refresh List</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Create Game Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Create New Game</h3>
              <p className="text-gray-600 mb-6">Choose your game visibility</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => createGame(true)}
                  className="w-full p-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Public Game</div>
                      <div className="text-sm text-indigo-100">Anyone can join from the lobby</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => createGame(false)}
                  className="w-full p-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Private Game</div>
                      <div className="text-sm text-green-100">Share code with friends to join</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateDialog(false)}
                className="w-full mt-4 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Join Private Game Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">#</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Join Private Game</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter 6-digit Game Code"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white"
            />
            <button
              className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg"
              onClick={joinByCode}
            >
              Join Game
            </button>
          </div>
        </div>

        {/* Waiting Public Games Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🎮</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Public Games</h3>
                <p className="text-sm text-gray-600">{waiting.length} game{waiting.length !== 1 ? 's' : ''} waiting</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
              <span className="text-indigo-700 font-bold text-lg">{waiting.length}</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {waiting.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎯</span>
                </div>
                <p className="text-gray-500 text-lg font-medium">No public games available</p>
                <p className="text-gray-400 text-sm mt-2">Be the first to create one!</p>
              </div>
            )}
            
            {waiting.map((g, index) => (
              <div 
                key={g.id} 
                className="group p-5 bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50 hover:to-purple-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="px-3 py-1 bg-indigo-100 rounded-lg">
                        <span className="text-xs font-semibold text-indigo-600 uppercase">Code</span>
                      </div>
                      <span className="font-mono font-bold text-2xl text-gray-800 tracking-widest">{g.gameCode}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Host: <span className="font-semibold text-gray-700">Player {g.playerX}</span></span>
                    </div>
                  </div>
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 group-hover:from-green-600 group-hover:to-emerald-600"
                    onClick={() => joinGame(g.id)}
                  >
                    Join Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}