import { Outlet } from 'react-router-dom';
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow p-6 rounded">
        <Outlet />
      </div>
    </div>
  );
}
