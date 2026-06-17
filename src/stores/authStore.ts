import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

interface User {
  id: number;
  email: string;
  nickname?: string;
  role: UserRole;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

// TODO(prod): access token은 메모리에만 보관하고
// refresh token은 httpOnly 쿠키로 분리할 것 (백엔드 연동 시).
// 현재는 mock + DEV 편의를 위해 둘 다 localStorage에 persist 중이다.
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
        updateUser: (patch) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...patch } : state.user,
            }),
            false,
            'auth/updateUser',
          ),
      }),
      { name: 'auth' },
    ),
    { name: 'authStore' },
  ),
);
