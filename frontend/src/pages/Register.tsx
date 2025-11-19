//Register.tsx
import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Decodes a JWT token and extracts the user ID.
 * @param token - The JWT returned from the server.
 * @returns The user ID if decoding is successful, else null.
 */
function decodeToken(token: string) {
  try {
    // JWT structure: header.payload.signature → we need the payload (index 1)
    const payloadBase64 = token.split('.')[1];

    // Convert Base64 → JSON object
    const payload = JSON.parse(atob(payloadBase64));

    return payload.id; // Return user ID from token
  } catch {
    return null; // Return null if token is invalid or decoding fails
  }
}

export default function Register() {
  // Local state for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI loading state (disables button)
  const [isLoading, setIsLoading] = useState(false);

  // For navigation after successful registration
  const nav = useNavigate();

  /**
   * Handles the registration form submission.
   * Sends username/password → receives token → saves token → navigates to lobby.
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make API call to backend registration route
      const r = await API.post('auth/register', { username, password });
      const token = r.data.token;

      // Save the JWT token for authentication across pages
      localStorage.setItem('token', token);

      // Decode token to get the user ID
      const uid = decodeToken(token);

      // Save user ID to localStorage
      if (uid) localStorage.setItem('uid', String(uid));

      // Redirect user to lobby after successful registration
      nav('/lobby');

    } catch (err: any) {
      // Show backend error message (ex: username already exists)
      alert(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background animation circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Registration Card Container */}
      <div className="w-full max-w-md relative">
        
        {/* Card */}
        <div className="bg-white backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10 space-y-8">
          
          {/* App Logo / Title */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3">
              
              {/* Tic-Tac-Toe icon */}
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
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Create your account and start playing!
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={submit} className="space-y-6">
            
            {/* Username field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">Username</label>
              <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Choose your username"
                aria-label="Username input"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white hover:border-gray-300"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">Password</label>
              <input 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                type="password"
                placeholder="Choose your password"
                aria-label="Password input"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-400 transition-all bg-gray-50 hover:bg-white hover:border-gray-300"
              />
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

          {/* Login link */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <Link 
              to="/"
              className="inline-block w-full py-3 text-base font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Login to Play
            </Link>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-600 mt-6 px-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>

      </div>
    </div>
  );
}
