/**
 * 마이페이지 관련 API 요청/응답 타입
 * - GET    /api/v1/accounts/me
 * - PATCH  /api/v1/accounts/me
 * - PATCH  /api/v1/accounts/me/password
 * - DELETE /api/v1/accounts/me
 */

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface MyProfileResponse {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
}

export interface UpdateProfileRequest {
  nickname: string;
}

export interface UpdateProfileResponse {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface WithdrawRequest {
  password: string;
}

export interface MypageErrorResponse {
  message: string;
  code?: string;
}
