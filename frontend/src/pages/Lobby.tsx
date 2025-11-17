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

export default function Lobby(){
  const [waiting, setWaiting] = useState<any[]>([]);
  const [codeInput, setCodeInput] = useState('');
  // State for non-blocking success/error messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const nav = useNavigate();

  // Helper to display messages without using window.alert
  function showMessage(text: string, type: 'success' | 'error') {
    setMessage({ text, type });
    // Auto-clear message after 5 seconds
    setTimeout(() => setMessage({ text: '', type: null }), 5000);
  }

  useEffect(() => {
    fetchWaiting();
  }, []);

  async function fetchWaiting() {
    try {
      const r = await API.get('/game/waiting', { headers: { Authorization: 'Bearer ' + getToken() } });
      setWaiting(r.data);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to fetch waiting games.', 'error');
    }
  }

  async function createGame(){
    try {
      const r = await API.post('/game/create', {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      showMessage(`Game created! Code: ${r.data.gameCode}. Redirecting...`, 'success');
      nav(`/game/${r.data.id}`);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to create game', 'error');
    }
  }

  async function joinGame(id: string){
    try {
      await API.post(`/game/join/${id}`, {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      nav(`/game/${id}`);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to join game', 'error');
    }
  }

  async function joinByCode(){
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
    // Full screen container with light background, padding for responsiveness
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      
      {/* Centering and Max Width Container. Spacing is now controlled by mb-* */}
      <div className="w-full max-w-4xl mx-auto">
        
        {/* LOGOUT BUTTON: Top right, positioned above main content */}
        <div className="flex justify-end mb-4">
          <button 
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150 transform hover:scale-[1.02]" 
            onClick={()=>{ logout(); nav('/'); }}
          >
            Logout
          </button>
        </div>

        {/* Message Box (Intuitive feedback) */}
        {message.text && (
          <div className={`p-4 rounded-lg font-medium text-center mb-6 ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300 shadow-md' : 
            'bg-red-100 text-red-700 border border-red-300 shadow-md'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header and Controls (Responsive Layout) - Contains Create and Refresh */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Game Lobby</h2>
          
          <div className="flex flex-wrap gap-3">
            <button 
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.02] w-full sm:w-auto" 
              onClick={createGame}
            >
              Create New Game
            </button>
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 transform hover:scale-[1.02] w-full sm:w-auto" 
              onClick={fetchWaiting}
            >
              Refresh List
            </button>
          </div>
        </div>
        
        {/* Join by Code Section (Responsive input/button alignment) */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Join Private Game</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Enter 6-digit Game Code" 
              value={codeInput} 
              onChange={e => setCodeInput(e.target.value.toUpperCase())} 
              className="p-3 border border-gray-300 rounded-lg flex-1 text-lg focus:ring-green-500 focus:border-green-500 focus:outline-none placeholder-gray-500"
            />
            <button 
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 w-full sm:w-auto" 
              onClick={joinByCode}
            >
              Join
            </button>
          </div>
        </div>

        {/* Waiting Games List */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Public Games Waiting ({waiting.length})</h3>
          <div className="space-y-3">
            {waiting.map(g => (
              <li key={g.id} className="list-none flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition duration-150">
                
                {/* Game Info (Responsive stacking) */}
                <div className="mb-2 sm:mb-0">
                  <span className="text-sm text-gray-500 block sm:inline mr-2">Code:</span>
                  <span className="font-mono font-bold text-lg text-gray-800 tracking-wider">{g.game_code}</span>
                  <span className="ml-0 sm:ml-6 text-sm text-gray-600 block sm:inline">Host ID: {g.player_x}</span>
                </div>
                
                {/* Join Button */}
                <button 
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 transition duration-150 w-full sm:w-auto" 
                  onClick={()=>joinGame(g.id)}
                >
                  Join Game
                </button>
              </li>
            ))}
            {waiting.length===0 && 
              <div className="text-center py-6 text-gray-500 italic">
                No public games are currently waiting. Be the first to create one!
              </div>
            }
          </div>
        </div>
        
      </div>
    </div>
  );
}