import { http, HttpResponse } from 'msw';
import type { LoginResponse, LoginErrorResponse, UserRole } from './types';
import type { LoginRequest } from './types';

// DEV-only mock credentials
// - test@cleanhouse.com / test1234 → USER (id: 1)
// - owner@cleanhouse.com / owner1234 → OWNER (id: 100)
interface MockAccount {
  id: number;
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
}

const TEST_ACCOUNTS: MockAccount[] = [
  {
    id: 1,
    email: 'test@cleanhouse.com',
    password: 'test1234',
    nickname: '테스트유저',
    role: 'USER',
  },
  {
    id: 100,
    email: 'owner@cleanhouse.com',
    password: 'owner1234',
    nickname: '사장님',
    role: 'OWNER',
  },
];

export const loginHandlers = [
  http.post<never, LoginRequest>('/api/v1/accounts/login', async ({ request }) => {
    const body = await request.json();

    const account = TEST_ACCOUNTS.find(
      (a) => a.email === body.email && a.password === body.password,
    );

    if (!account) {
      const errorBody: LoginErrorResponse = {
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CREDENTIALS',
      };
      return HttpResponse.json(errorBody, { status: 401 });
    }

    const successBody: LoginResponse = {
      accessToken:
        account.role === 'OWNER' ? 'mock-owner-token' : 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: account.id,
        email: account.email,
        nickname: account.nickname,
        role: account.role,
      },
    };
    return HttpResponse.json(successBody);
  }),
];
