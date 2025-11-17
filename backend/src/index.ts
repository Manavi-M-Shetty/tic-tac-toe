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
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

const port = process.env.PORT || 4000;
const server = http.createServer(app);
const io = setupSocket(server, process.env.FRONTEND_URL || 'http://localhost:5173');

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
