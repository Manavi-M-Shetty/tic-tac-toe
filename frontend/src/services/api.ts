//api.ts
// ------------------------------------------------------------
// This file sets up a reusable Axios instance for making API
// calls from the frontend to the backend server.
// ------------------------------------------------------------

import axios from 'axios';

// Create an Axios instance with a base URL.
// VITE_API_URL comes from your Vite environment variables.
// If it's not provided, it defaults to your local backend.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export default API;
