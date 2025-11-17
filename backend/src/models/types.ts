export type User = {
  id: number;
  username: string;
  password_hash: string;
};

export type Game = {
  id: string; // uuid
  player_x?: number; // user id
  player_o?: number;
  status: 'waiting' | 'playing' | 'finished';
  winner?: 'X' | 'O' | 'draw' | null;
  board: string; // 9 chars: 'X', 'O' or '-' for empty
};
