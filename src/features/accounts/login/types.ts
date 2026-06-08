/**
 * 로그인 API 요청/응답 타입
 * POST /api/v1/accounts/login
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nickname?: string;
  };
}

export interface LoginErrorResponse {
  message: string;
  code?: string;
}
