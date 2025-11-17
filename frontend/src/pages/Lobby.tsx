import { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function getToken() {
  return localStorage.getItem('token') || '';
}

export default function Lobby(){
  const [waiting, setWaiting] = useState<any[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    fetchWaiting();
  }, []);

  async function fetchWaiting() {
    const r = await API.get('/game/waiting', { headers: { Authorization: 'Bearer ' + getToken() } });
    setWaiting(r.data);
  }

  async function createGame(){
    try {
      const r = await API.post('/game/create', {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      alert(`Game created! Code: ${r.data.gameCode}`);
      nav(`/game/${r.data.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create game');
    }
  }

  async function joinGame(id: string){
    try {
      await API.post(`/game/join/${id}`, {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      nav(`/game/${id}`);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to join game');
    }
  }

  async function joinByCode(){
    if (!codeInput.trim()) return;
    try {
      const r = await API.post(`/game/join-code/${codeInput}`, {}, { headers: { Authorization: 'Bearer ' + getToken() } });
      setCodeInput('');
      nav(`/game/${r.data.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to join game with code');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Lobby</h2>
        <div>
          <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2" onClick={createGame}>Create Game</button>
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={fetchWaiting}>Refresh</button>
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-2">Join by Code</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter game code" 
            value={codeInput} 
            onChange={e => setCodeInput(e.target.value.toUpperCase())} 
            className="p-2 border rounded flex-1"
          />
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={joinByCode}>Join</button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Waiting Games</h3>
        <ul>
          {waiting.map(g => (
            <li key={g.id} className="flex justify-between items-center p-2 border rounded mb-2">
              <div>
                <span className="font-mono font-bold">{g.game_code}</span>
                <span className="ml-3 text-gray-600">Host ID: {g.player_x}</span>
              </div>
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={()=>joinGame(g.id)}>Join</button>
            </li>
          ))}
          {waiting.length===0 && <div className="text-gray-500">No waiting games. Create one or join using a code!</div>}
        </ul>
      </div>
    </div>
  );
}
