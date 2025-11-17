import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const nav = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      const r = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', r.data.token);
      nav('/lobby');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="username" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="password" className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
      </form>
      <div className="mt-4">No account? <Link to="/register" className="text-blue-600">Register</Link></div>
    </div>
  );
}
