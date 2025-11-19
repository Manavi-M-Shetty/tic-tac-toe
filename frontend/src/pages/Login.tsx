//Login.tsx
// ------------------------------------------------------------

import { useState } from 'react';
import API from '../services/api'; 
import { useNavigate, Link } from 'react-router-dom';

/**
 * Decodes a JWT token and extracts the user ID.
 * The JWT payload is Base64 decoded and parsed into JSON.
 * Returns null if decoding fails.
 */
function decodeToken(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.id;   // user ID stored in token
  } catch {
    return null;
  }
}

export default function Login() {
  // form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // used to show loading spinner on login button
  const [isLoading, setIsLoading] = useState(false);

  // navigation hook
  const nav = useNavigate();

  /**
   * Handles form submit:
   *  1. Sends login request to backend.
   *  2. Stores JWT token in localStorage.
   *  3. Extracts and stores user ID.
   *  4. Redirects user to lobby on success.
   *  5. Shows alert if login fails.
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const r = await API.post('auth/login', { username, password });
      const token = r.data.token;

      // Save token for protected routes
      localStorage.setItem('token', token);

      // Decode token to extract user ID
      const uid = decodeToken(token);
      if (uid) localStorage.setItem('uid', String(uid));

      // Go to lobby
      nav('/lobby');

    } catch (err: any) {
      // Show backend error message
      alert(err?.response?.data?.error || 'Login failed. Check your username and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md relative">
        <div className="bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 space-y-8">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3">
              
              {/* Simple X/O icon */}
              <div className="grid grid-cols-2 gap-1">
                <div className="w-6 h-6 border-4 border-white rounded-full"></div>
                <div className="w-6 h-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-white transform rotate-45"></div>
                    <div className="w-full h-1 bg-white transform -rotate-45 absolute"></div>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tic-Tac-Toe
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Welcome back! Ready to play?</p>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={submit} className="space-y-6">

            {/* Username input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">Username</label>
              <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white hover:border-gray-300"
              />
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">Password</label>
              <input 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white hover:border-gray-300"
              />
            </div>

            {/* Login button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 rounded-full">or</span>
            </div>
          </div>

          {/* Registration link */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-block w-full py-3 text-base font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Create Account
            </Link>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

    </div>
  );
}
