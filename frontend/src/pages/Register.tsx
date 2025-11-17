import { useState } from 'react';
import API from '../services/api'; 
import { useNavigate, Link } from 'react-router-dom';

/**
 * Helper function to decode a JWT and extract the user ID ('id' field from payload).
 */
function decodeToken(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
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
      const r = await API.post('/auth/login', { username, password });
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
    // Main container with a subtle background and pattern
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all duration-300 hover:scale-[1.01]">
        
        {/* Left Section: Visual / Promotional (Indigo/Blue theme for contrast) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-white bg-gradient-to-br from-indigo-500 to-blue-600 rounded-l-2xl">
          <h2 className="text-4xl font-extrabold mb-4 text-center leading-tight">
            Welcome Back!
          </h2>
          <p className="text-lg text-center opacity-90 mb-6 max-w-xs">
            Enter your credentials to jump back into the Tic-Tac-Toe action and resume your challenges.
          </p>
          {/* Simple illustrative icon (using a lock/key icon for security/login) */}
          <div className="p-4 bg-white bg-opacity-20 rounded-full">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v5.5a4 4 0 01-8 0V9a2 2 0 012-2zm-5 4v.5m0 3V11m2-4V9a2 2 0 00-2-2z"/>
            </svg>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
            Log In
          </h1>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                id="username"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Enter your username" 
                className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-150 ease-in-out text-gray-800 placeholder-gray-400" 
                aria-label="Username input"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                id="password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                type="password" 
                placeholder="Enter your password" 
                className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-150 ease-in-out text-gray-800 placeholder-gray-400" 
                aria-label="Password input"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 text-xl font-bold bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0 active:bg-indigo-800"
            >
              Go Play!
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center text-md text-gray-600">
            No account? 
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold ml-2 transition duration-150">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}