import {
  queryOptions,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { instance } from '@/api/instance';
import type {
  CreateReplyRequest,
  OwnerReply,
  ReviewDetail,
  UpdateReplyRequest,
} from './types';

const REVIEW_DETAIL_STALE_TIME = 60_000;

export const reviewDetailOptions = (id: number) =>
  queryOptions({
    queryKey: ['reviews', 'detail', id] as const,
    queryFn: () =>
      instance.get<ReviewDetail>(`/api/v1/reviews/${id}`).then((r) => r.data),
    staleTime: REVIEW_DETAIL_STALE_TIME,
  });

export function useReviewDetail(id: number) {
  return useSuspenseQuery(reviewDetailOptions(id));
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      instance.delete(`/api/v1/reviews/${id}`).then(() => undefined),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['reviews', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'list'] });
    },
  });
}

export function useCreateOwnerReply(reviewId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReplyRequest) =>
      instance
        .post<OwnerReply>(`/api/v1/reviews/${reviewId}/reply`, body)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
}

export function useUpdateOwnerReply(reviewId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReplyRequest) =>
      instance
        .put<OwnerReply>(`/api/v1/reviews/${reviewId}/reply`, body)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
}

export function useDeleteOwnerReply(reviewId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      instance.delete(`/api/v1/reviews/${reviewId}/reply`).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
}
