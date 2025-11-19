/**
 * Server Setup (index.ts)
 * ------------------------
 * This file initializes the Express server, configures middleware,
 * sets up API routes, enables CORS for allowed frontend domains,
 * and attaches the WebSocket (Socket.IO) server.
 *
 * Key Responsibilities:
 *  - Load environment variables (PORT, secrets, DB URL, etc.)
 *  - Parse incoming JSON requests
 *  - Configure CORS to allow requests only from trusted frontend URLs
 *  - Register authentication and game API routes
 *  - Create an HTTP server wrapper for Socket.IO integration
 *  - Start listening on the configured port
 *
 * CORS Notes:
 *  The `allowedOrigins` array lists the frontend URLs that are permitted
 *  to interact with this backend. This prevents unauthorized domains
 *  from making requests to your API.
 *
 * Socket.IO:
 *  The WebSocket server is initialized through the `setupSocket` function.
 *  It receives the HTTP server instance so that Express and Socket.IO
 *  can run together on the same port.
 *
 * Startup:
 *  Run the server using:
 *      npm run dev
 *  or after deployment, Render/Vercel/your host will handle starting it.
 */

import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import setupSocket from './socket';

const app = express();
app.use(express.json());

/**
 * Allowed frontend URLs that can access this backend.
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://tic-tac-toe-three-jade.vercel.app",
  "https://tic-tac-hatyskd33-manavi-m-shettys-projects.vercel.app"
];

// Enable CORS for specific origins
app.use(cors({ origin: allowedOrigins }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Create HTTP server and attach WebSocket server
const port = process.env.PORT || 4000;
const server = http.createServer(app);
const io = setupSocket(server, allowedOrigins);

// Start listening for requests
server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
