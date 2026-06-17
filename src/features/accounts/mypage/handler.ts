import { http, HttpResponse } from 'msw';
import { mockReviewStore } from '@/features/reviews/shared/mockStore';
import type {
  ChangePasswordRequest,
  MyProfileResponse,
  MypageErrorResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserRole,
  WithdrawRequest,
} from './types';

/**
 * DEV-only mock 계정 — login/handler.ts와 동일한 시드 데이터.
 * 닉네임/비밀번호/탈퇴 상태는 mockReviewStore에 저장되어 새로고침 후에도 유지됩니다.
 */
interface MockProfile {
  id: number;
  email: string;
  defaultNickname: string;
  role: UserRole;
  password: string;
  createdAt: string;
}

const MOCK_PROFILES: MockProfile[] = [
  {
    id: 1,
    email: 'test@cleanhouse.com',
    defaultNickname: '테스트유저',
    role: 'USER',
    password: 'test1234',
    createdAt: '2025-01-01',
  },
  {
    id: 100,
    email: 'owner@cleanhouse.com',
    defaultNickname: '사장님',
    role: 'OWNER',
    password: 'owner1234',
    createdAt: '2025-01-01',
  },
];

function unauthorized() {
  const error: MypageErrorResponse = {
    message: '인증이 필요합니다.',
    code: 'UNAUTHORIZED',
  };
  return HttpResponse.json(error, { status: 401 });
}

/**
 * Authorization 헤더 값으로 어떤 mock 계정인지 식별합니다.
 * - 'Bearer mock-owner-token' → OWNER (id: 100)
 * - 그 외 토큰이 존재하면 USER (id: 1)
 * - 토큰이 없으면 null 반환
 */
function resolveProfile(request: Request): MockProfile | null {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;

  if (auth.includes('mock-owner-token')) {
    return MOCK_PROFILES.find((p) => p.id === 100) ?? null;
  }
  return MOCK_PROFILES.find((p) => p.id === 1) ?? null;
}

function getCurrentPassword(profile: MockProfile): string {
  return mockReviewStore.getPassword(profile.id) ?? profile.password;
}

function toResponse(profile: MockProfile): MyProfileResponse {
  const stored = mockReviewStore.getNickname(profile.id);
  return {
    id: profile.id,
    email: profile.email,
    nickname: stored ?? profile.defaultNickname,
    role: profile.role,
    createdAt: profile.createdAt,
  };
}

export const mypageHandlers = [
  // GET /api/v1/accounts/me — 내 정보 조회
  http.get('/api/v1/accounts/me', ({ request }) => {
    const profile = resolveProfile(request);
    if (!profile || mockReviewStore.isWithdrawn(profile.id)) {
      return unauthorized();
    }
    return HttpResponse.json(toResponse(profile));
  }),

  // PATCH /api/v1/accounts/me — 닉네임 수정 (PUT 대신 PATCH로 시맨틱 일관성 유지)
  http.patch<never, UpdateProfileRequest>('/api/v1/accounts/me', async ({ request }) => {
    const profile = resolveProfile(request);
    if (!profile) return unauthorized();

    const body = await request.json();
    const nickname = body.nickname?.trim();

    if (!nickname) {
      const error: MypageErrorResponse = {
        message: '닉네임을 입력해주세요.',
        code: 'NICKNAME_REQUIRED',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    if (nickname.length < 2 || nickname.length > 20) {
      const error: MypageErrorResponse = {
        message: '닉네임은 2~20자로 입력해주세요.',
        code: 'NICKNAME_INVALID_LENGTH',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    mockReviewStore.updateNickname(profile.id, nickname);
    const updated = toResponse(profile);
    const response: UpdateProfileResponse = updated;
    return HttpResponse.json(response);
  }),

  // PATCH /api/v1/accounts/me/password — 비밀번호 변경
  http.patch<never, ChangePasswordRequest>(
    '/api/v1/accounts/me/password',
    async ({ request }) => {
      const profile = resolveProfile(request);
      if (!profile) return unauthorized();

      const body = await request.json();

      // 1) 새 비밀번호 길이 검증
      if (!body.newPassword || body.newPassword.length < 8) {
        const error: MypageErrorResponse = {
          message: '새 비밀번호는 8자 이상이어야 합니다.',
          code: 'PASSWORD_TOO_SHORT',
        };
        return HttpResponse.json(error, { status: 400 });
      }

      // 2) 현재/새 비밀번호 동일 여부
      if (body.newPassword === body.currentPassword) {
        const error: MypageErrorResponse = {
          message: '현재 비밀번호와 다른 비밀번호를 입력해주세요.',
          code: 'PASSWORD_SAME_AS_CURRENT',
        };
        return HttpResponse.json(error, { status: 400 });
      }

      // 3) 현재 비밀번호 정확성 검증
      const stored = getCurrentPassword(profile);
      if (body.currentPassword !== stored) {
        const error: MypageErrorResponse = {
          message: '현재 비밀번호가 일치하지 않습니다.',
          code: 'INVALID_CURRENT_PASSWORD',
        };
        return HttpResponse.json(error, { status: 400 });
      }

      mockReviewStore.setPassword(profile.id, body.newPassword);
      return HttpResponse.json({ success: true });
    },
  ),

  // DELETE /api/v1/accounts/me — 회원 탈퇴
  http.delete<never, WithdrawRequest>('/api/v1/accounts/me', async ({ request }) => {
    const profile = resolveProfile(request);
    if (!profile) return unauthorized();

    const body = await request.json();
    const stored = getCurrentPassword(profile);

    if (body.password !== stored) {
      const error: MypageErrorResponse = {
        message: '비밀번호가 일치하지 않습니다.',
        code: 'INVALID_PASSWORD',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    mockReviewStore.withdraw(profile.id);
    return HttpResponse.json({ success: true });
  }),
];
