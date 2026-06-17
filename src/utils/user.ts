/**
 * 사용자 표시 관련 공통 유틸.
 * - ROLE_LABEL: UserRole → 한국어 표시 라벨 매핑
 * - getInitial: 닉네임/이름의 첫 글자 추출 (아바타 fallback 용)
 */

export const ROLE_LABEL: Record<string, string> = {
  USER: '일반회원',
  OWNER: '사업자',
  ADMIN: '관리자',
};

export function getInitial(value: string | undefined | null): string {
  if (!value) return '?';
  return value.trim().charAt(0).toUpperCase();
}
