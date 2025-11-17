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
  // New state for non-blocking success/error messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const nav = useNavigate(); // Hook to change routes programmatically

  // Helper to display messages without using window.alert
  function showMessage(text: string, type: 'success' | 'error') {
    setMessage({ text, type });
    // Auto-clear message after 5 seconds
    setTimeout(() => setMessage({ text: '', type: null }), 5000);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission and page reload
    try {
      // 1. Call the registration endpoint
      const r = await API.post('/auth/register', { username, password });
      
      const token = r.data.token;
      
      // 2. Store the token in local storage for subsequent authenticated requests
      localStorage.setItem('token', token);
      
      // 3. Decode the token to get the user ID
      const uid = decodeToken(token);
      
      // 4. Store the user ID (useful for context/state management)
      if (uid) localStorage.setItem('uid', String(uid));
      
      // Show success message and navigate
      showMessage('Registration successful! Redirecting to lobby...', 'success');
      
      // 5. Navigate to the game lobby
      nav('/lobby');

    } catch (err: any) {
      // Handle and display error from the backend (e.g., username already exists)
      // Replaced alert() with showMessage()
      showMessage(err?.response?.data?.error || 'Registration failed. Please try again.', 'error');
    }
  };

  return (
    // Full screen container to center the card. Uses a responsive, non-scrollable background.
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      
      {/* Registration Card/Panel: Clean, rounded, minimal style */}
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-200">
        
        {/* Title: Large, bold, centered, matching the desired aesthetic */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center leading-snug">
          Create Account for Tic-Tac-Toe
        </h1>
        
        {/* Message Box (Intuitive feedback) */}
        {message.text && (
          <div className={`p-3 rounded-lg font-medium text-center ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
            'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}


        <form onSubmit={submit} className="space-y-4">
          
          {/* Username Input: Increased padding, soft corners, and focus ring */}
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            placeholder="Choose Username" 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none placeholder-gray-500 text-lg" 
            aria-label="Choose Username"
          />
          
          {/* Password Input: Increased padding, soft corners, and focus ring */}
          <input 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            type="password" 
            placeholder="Choose Password" 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 focus:outline-none placeholder-gray-500 text-lg" 
            aria-label="Choose Password"
          />
          
          {/* Register Button: Green primary action, large, bold, and responsive effects */}
          <button 
            type="submit"
            className="w-full py-3 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200 transform active:bg-green-800"
          >
            Start Playing!
          </button>
        </form>

        {/* Login Link: Centered, small text for consistency */}
        <div className="pt-2 text-center text-md text-gray-600">
          Already have an account? 
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold ml-1 transition duration-150">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}