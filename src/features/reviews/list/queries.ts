import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { instance } from '@/api/instance';
import type { ReviewListParams, ReviewListResponse } from './types';

export function useReviewList(params: ReviewListParams) {
  return useQuery({
    queryKey: ['reviews', 'list', params],
    queryFn: () =>
      instance.get<ReviewListResponse>('/api/v1/reviews', { params }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}
