import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const nav = useNavigate();

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      const r = await API.post('/auth/register', { username, password });
      localStorage.setItem('token', r.data.token);
      nav('/lobby');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="username" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" placeholder="password" className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
      </form>
      <div className="mt-4">Have account? <Link to="/" className="text-blue-600">Login</Link></div>
    </div>
  );
}
