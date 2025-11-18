import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Helper function to decode a JWT and extract the user ID ('id' field from payload).
 * @param token The JWT string.
 * @returns The user ID as a string, or null if decoding fails.
 */
function decodeToken(token: string) {
  try {
    // A JWT is split into three parts by '.', the payload is the second part (index 1).
    const payloadBase64 = token.split('.')[1];
    // Decode from Base64 (using atob) and parse the JSON.
    const payload = JSON.parse(atob(payloadBase64));
    return payload.id;
  } catch {
    return null;
  }
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Call the registration endpoint
      const r = await API.post('auth/register', { username, password });
      
      const token = r.data.token;
      
      // 2. Store the token in local storage for subsequent authenticated requests
      localStorage.setItem('token', token);
      
      // 3. Decode the token to get the user ID
      const uid = decodeToken(token);
      
      // 4. Store the user ID (useful for context/state management)
      if (uid) localStorage.setItem('uid', String(uid));
      
      // 5. Navigate to the game lobby
      nav('/lobby');

    } catch (err: any) {
      // Handle and display error from the backend (e.g., username already exists)
      alert(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md relative">
        <div className="bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 space-y-8">
          
          {/* Logo/Icon Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3">
              {/* Simple CSS X and O game icon */}
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
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Join the Game
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Create your account and start playing!</p>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={submit} className="space-y-6">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">Username</label>
              <input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Choose your username" 
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white hover:border-gray-300" 
                aria-label="Username input"
              />
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">Password</label>
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                type="password" 
                placeholder="Choose your password" 
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white hover:border-gray-300" 
                aria-label="Password input"
              />
              <p className="text-xs text-gray-500 ml-1">Must be at least 6 characters long</p>
            </div>
            
            {/* Register Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Start Playing!'
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

          {/* Login Link */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have an account?
            </p>
            <Link 
              to="/"
              className="inline-block w-full py-3 text-base font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Login to Play
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-600 mt-6 px-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}