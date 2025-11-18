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

const allowedOrigins = [
  "http://localhost:5173",
  "https://tic-tac-toe-frontend-gules.vercel.app",
  "https://tic-tac-toe-frontend-7l3wrqdei-manavi-m-shettys-projects.vercel.app"
];
app.use(cors({ origin: allowedOrigins}));

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);


const port = process.env.PORT || 4000;
const server = http.createServer(app);
const io = setupSocket(server, allowedOrigins);

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
