import type { Timestamp } from 'firebase/firestore';

export type Player = {
  id: string;
  name: string;
  createdAt: Timestamp;
};
