/**
 * mutation/query 에러 처리 공통 유틸.
 *
 * axios 에러 응답에서 `{ message: string }` 형태를 추출하고,
 * 추출에 실패하면 fallback 메시지를 반환한다.
 */

import { AxiosError } from 'axios';

interface ErrorBody {
  message?: string;
  code?: string;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorBody | undefined;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
