import { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function getToken() {
  return localStorage.getItem('token') || '';
}

export default function Lobby(){
  const [waiting, setWaiting] = useState<any[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    fetchWaiting();
  }, []);

  async function fetchWaiting() {
    const r = await API.get('/game/waiting', { headers: { Authorization: 'Bearer ' + getToken() } });
    setWaiting(r.data);
  }

  async function createGame(){
    const r = await API.post('/game/create', {}, { headers: { Authorization: 'Bearer ' + getToken() } });
    nav(`/game/${r.data.id}`);
  }

  async function joinGame(id: string){
    await API.post(`/game/join/${id}`, {}, { headers: { Authorization: 'Bearer ' + getToken() } });
    nav(`/game/${id}`);
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
      <div>
        <h3 className="font-semibold mb-2">Waiting Games</h3>
        <ul>
          {waiting.map(g => (
            <li key={g.id} className="flex justify-between p-2 border rounded mb-2">
              <span>Game {g.id.slice(0,8)} | Host: {g.player_x}</span>
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={()=>joinGame(g.id)}>Join</button>
            </li>
          ))}
          {waiting.length===0 && <div>No waiting games</div>}
        </ul>
      </div>
    </div>
  );
}
