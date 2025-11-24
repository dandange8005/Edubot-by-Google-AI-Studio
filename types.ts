export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isError?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 string
  size: number;
}

export interface Bot {
  id: string;
  title: string;
  description: string;
  files: UploadedFile[];
  createdAt: number;
  theme?: 'indigo' | 'emerald' | 'blue' | 'violet';
}

export type LoadingState = 'idle' | 'streaming' | 'error';