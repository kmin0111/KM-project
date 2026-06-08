import { useMutation } from '@tanstack/react-query';
import { instance } from '@/api/instance';
import type { LoginRequest, LoginResponse } from './types';

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginRequest) =>
      instance.post<LoginResponse>('/api/v1/accounts/login', body).then((r) => r.data),
  });
}
