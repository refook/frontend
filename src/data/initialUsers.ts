import type { User } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user-1',
    email: 'maria@example.com',
    name: 'Мария Петрова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    preferences: {
      theme: 'light',
      language: 'ru',
      notifications: { email: true, push: false }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'alex@example.com',
    name: 'Алексей Иванов',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    preferences: {
      theme: 'dark',
      language: 'ru',
      notifications: { email: false, push: true }
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]; 