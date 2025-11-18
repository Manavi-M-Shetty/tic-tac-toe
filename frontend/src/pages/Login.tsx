import { useState } from 'react';
import API from '../services/api'; 
import { useNavigate, Link } from 'react-router-dom';

/**
 * Helper function to decode a JWT and extract the user ID ('id' field from payload).
 */
function decodeToken(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    // Use atob() to decode Base64 and then JSON.parse()
    const payload = JSON.parse(atob(payloadBase64)); 
    return payload.id;
  } catch {
    return null;
  }
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await API.post('auth/login', { username, password });
      const token = r.data.token;
      
      localStorage.setItem('token', token);
      
      const uid = decodeToken(token);
      if (uid) localStorage.setItem('uid', String(uid));
      
      // Navigate to the game lobby after successful login
      nav('/lobby');
      
    } catch (err: any) {
      // Display error message from the backend
      alert(err?.response?.data?.error || 'Login failed. Check your username and password.');
    }
  };

  return (
    // Full screen container to center the card. Using a subtle light background.
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      
      {/* Login Card/Panel: Matches the image style */}
      <div className="w-full max-w-sm p-10 space-y-8 bg-white rounded-xl shadow-xl border border-gray-200">
        
        {/* Title, similar bold styling to the image */}
        <h1 className="text-3xl font-extrabold text-gray-900 text-center leading-snug">
          Log In to Tic-Tac-Toe
        </h1>

        <form onSubmit={submit} className="space-y-6">
          
          {/* Username Input: Rounded and padded like the image */}
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            placeholder="Username" 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-500" 
            aria-label="Username input"
          />
          
          {/* Password Input: Rounded and padded like the image */}
          <input 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-500" 
            aria-label="Password input"
          />
          
          {/* Login Button: Matches the style, using blue for Login */}
          <button 
            type="submit"
            className="w-full py-3 text-xl font-bold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 transform active:bg-blue-800"
          >
            Login
          </button>
        </form>

        {/* Registration Link: Centered text */}
        <div className="pt-2 text-center text-sm text-gray-600">
          No account? 
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold ml-1">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}