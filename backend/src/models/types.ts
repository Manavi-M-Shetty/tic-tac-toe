export type User = {
  id: number;
  username: string;
  password_hash: string;
};

export type Game = {
  id: string; // uuid
  player_x?: number;
  player_o?: number;
  status: 'waiting' | 'playing' | 'finished';
  winner?: 'X' | 'O' | 'draw' | null;
  board: string;
};