import { http, HttpResponse } from 'msw';
import type { SignupRequest, SignupResponse, SignupErrorResponse } from './types';

// DEV-only stateful mock: 페이지 새로고침 전까지 등록된 이메일이 유지됩니다.
// E2E 테스트에서는 케이스별로 고유한 이메일을 사용하거나 페이지를 새로고침하세요.
const registeredEmails = new Set<string>(['test@cleanhouse.com']);

export const signupHandlers = [
  http.post<never, SignupRequest>('/api/v1/accounts/signup', async ({ request }) => {
    const body = await request.json();

    if (registeredEmails.has(body.email)) {
      const error: SignupErrorResponse = {
        message: '이미 사용 중인 이메일입니다.',
        code: 'EMAIL_DUPLICATED',
      };
      return HttpResponse.json(error, { status: 409 });
    }

    if (body.role === 'OWNER' && !body.companyName?.trim()) {
      const error: SignupErrorResponse = {
        message: '업체명을 입력해주세요.',
        code: 'COMPANY_NAME_REQUIRED',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    if (body.password.length < 8) {
      const error: SignupErrorResponse = {
        message: '비밀번호는 8자 이상이어야 합니다.',
        code: 'PASSWORD_TOO_SHORT',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    registeredEmails.add(body.email);

    const success: SignupResponse = {
      user: {
        id: Math.floor(Math.random() * 100000),
        email: body.email,
        nickname: body.nickname,
        role: body.role,
      },
    };
    return HttpResponse.json(success, { status: 201 });
  }),
];
