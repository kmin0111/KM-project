import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  nickname?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        refreshToken: null,
        user: null,
        isLoggedIn: false,
        login: (accessToken, refreshToken, user) =>
          set({ accessToken, refreshToken, user, isLoggedIn: true }, false, 'auth/login'),
        logout: () =>
          set(
            { accessToken: null, refreshToken: null, user: null, isLoggedIn: false },
            false,
            'auth/logout',
          ),
      }),
      { name: 'auth' },
    ),
    { name: 'authStore' },
  ),
);
