import { useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '@/api/instance';
import type {
  CreateReviewRequest,
  CreateReviewResponse,
  UpdateReviewArgs,
  UpdateReviewResponse,
} from './types';

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewRequest) =>
      instance
        .post<CreateReviewResponse>('/api/v1/reviews', body)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'list'] });
    },
    // 에러는 호출부에서 mutation.error로 받아 인라인 메시지로 표시한다.
  });
}

/**
 * 후기 수정 mutation.
 *
 * id를 훅 호출 시점이 아닌 mutate 시점에 전달하여,
 * id가 아직 없는 상태(상세 로딩 전)에서도 안전하게 훅을 선언할 수 있다.
 *
 * @example
 *   const update = useUpdateReview();
 *   update.mutate({ id: 42, body });
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: UpdateReviewArgs) =>
      instance
        .put<UpdateReviewResponse>(`/api/v1/reviews/${id}`, body)
        .then((r) => r.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'list'] });
    },
  });
}
