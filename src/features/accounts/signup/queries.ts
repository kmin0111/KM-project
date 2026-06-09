import { useMutation } from '@tanstack/react-query';
import { instance } from '@/api/instance';
import type { SignupRequest, SignupResponse } from './types';

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupRequest) =>
      instance.post<SignupResponse>('/api/v1/accounts/signup', body).then((r) => r.data),
  });
}
