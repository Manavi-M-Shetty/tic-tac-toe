import { useState } from 'react';
import API from '../services/api'; // Ensure this path is correct based on your file structure
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
  const nav = useNavigate(); // Hook to change routes programmatically

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission and page reload
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
    }
  };

  return (
    // Full screen container to center the registration form
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      
      {/* Registration Card/Panel */}
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">
          Create Account for Tic-Tac-Toe
        </h1>

        <form onSubmit={submit} className="space-y-4">
          
          {/* Username Input */}
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            placeholder="Choose Username" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none" 
            aria-label="Username"
          />
          
          {/* Password Input */}
          <input 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            type="password" 
            placeholder="Choose Password" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none" 
            aria-label="Password"
          />
          
          {/* Register Button */}
          <button 
            type="submit"
            className="w-full px-4 py-3 text-lg font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-md active:bg-green-800"
          >
            Start Playing!
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          Already have an account? 
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}