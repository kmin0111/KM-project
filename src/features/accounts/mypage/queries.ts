import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { instance } from '@/api/instance';
import { useAuthStore } from '@/stores/authStore';
import type {
  ChangePasswordRequest,
  MyProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  WithdrawRequest,
} from './types';

export const MY_PROFILE_QUERY_KEY = ['accounts', 'me'] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: () =>
      instance.get<MyProfileResponse>('/api/v1/accounts/me').then((r) => r.data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) =>
      instance
        .patch<UpdateProfileResponse>('/api/v1/accounts/me', body)
        .then((r) => r.data),
    onSuccess: (data) => {
      // 서버 상태 캐시 무효화 + 클라이언트 authStore도 함께 갱신해
      // 헤더/사이드바 등 다른 위젯이 곧바로 새 닉네임을 반영하도록 한다.
      queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY });
      useAuthStore.getState().updateUser({ nickname: data.nickname });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) =>
      instance.patch('/api/v1/accounts/me/password', body).then((r) => r.data),
  });
}

export function useWithdraw() {
  return useMutation({
    mutationFn: (body: WithdrawRequest) =>
      instance
        .delete('/api/v1/accounts/me', { data: body })
        .then((r) => r.data),
  });
}
