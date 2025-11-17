import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="lobby" element={<Lobby />} />
          <Route path="game/:id" element={<Game />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
