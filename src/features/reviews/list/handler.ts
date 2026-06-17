import { http, HttpResponse } from 'msw';
import { mockReviewStore } from '../shared/mockStore';
import { MOCK_REVIEWS } from './mockData';
import type { Review, ReviewListResponse, ReviewServiceType, ReviewSort } from './types';

const SERVICE_TYPES: ReviewServiceType[] = ['정기청소', '입주청소', '특수청소'];
const SORT_TYPES: ReviewSort[] = ['latest', 'rating'];

/**
 * 기본 mockData와 사용자가 작성/수정/삭제한 후기를 합쳐 최종 목록을 만든다.
 * - 새로 작성된 후기는 최상단에 노출
 * - 수정된 후기는 patch를 반영
 * - 삭제된 후기는 제외
 */
function buildReviewList(): Review[] {
  const created = mockReviewStore.getCreatedReviews().map<Review>((r) => ({
    id: r.id,
    type: r.type,
    rating: r.rating,
    content: r.content,
    author: r.author,
    useCount: r.useCount,
    createdAt: r.createdAt,
  }));

  const base = MOCK_REVIEWS
    .filter((r) => !mockReviewStore.isDeleted(r.id))
    .map<Review>((r) => {
      const patch = mockReviewStore.getUpdate(r.id);
      if (!patch) return r;
      return {
        ...r,
        type: patch.type ?? r.type,
        rating: patch.rating ?? r.rating,
        content: patch.content ?? r.content,
      };
    });

  return [...created, ...base];
}

export const reviewListHandlers = [
  http.get('/api/v1/reviews', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const size = Number(url.searchParams.get('size') ?? '10');

    const rawType = url.searchParams.get('type');
    const type: ReviewServiceType | null = SERVICE_TYPES.includes(
      rawType as ReviewServiceType,
    )
      ? (rawType as ReviewServiceType)
      : null;

    const rawSort = url.searchParams.get('sort');
    const sort: ReviewSort = SORT_TYPES.includes(rawSort as ReviewSort)
      ? (rawSort as ReviewSort)
      : 'latest';

    let filtered = buildReviewList();
    if (type) {
      filtered = filtered.filter((review) => review.type === type);
    }

    if (sort === 'rating') {
      filtered.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * size;
    const content = filtered.slice(start, start + size);

    const averageRating =
      totalCount === 0
        ? 0
        : Math.round((filtered.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10;

    const response: ReviewListResponse = {
      content,
      totalCount,
      totalPages,
      currentPage,
      averageRating,
    };

    return HttpResponse.json(response);
  }),
];
