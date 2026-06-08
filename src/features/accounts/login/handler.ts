import { http, HttpResponse } from 'msw';
import type { LoginResponse, LoginErrorResponse } from './types';
import type { LoginRequest } from './types';

// DEV-only mock credentials: test@cleanhouse.com / test1234
const TEST_ACCOUNT = {
  email: 'test@cleanhouse.com',
  password: 'test1234',
};

export const loginHandlers = [
  http.post<never, LoginRequest>('/api/v1/accounts/login', async ({ request }) => {
    const body = await request.json();

    if (body.email !== TEST_ACCOUNT.email || body.password !== TEST_ACCOUNT.password) {
      const errorBody: LoginErrorResponse = {
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        code: 'INVALID_CREDENTIALS',
      };
      return HttpResponse.json(errorBody, { status: 401 });
    }

    const successBody: LoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 1, email: body.email, nickname: '테스트유저' },
    };
    return HttpResponse.json(successBody);
  }),
];
