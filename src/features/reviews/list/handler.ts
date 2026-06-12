import { http, HttpResponse } from 'msw';
import { MOCK_REVIEWS } from './mockData';
import type { ReviewListResponse, ReviewServiceType, ReviewSort } from './types';

const SERVICE_TYPES: ReviewServiceType[] = ['정기청소', '입주청소', '특수청소'];
const SORT_TYPES: ReviewSort[] = ['latest', 'rating'];

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

    let filtered = [...MOCK_REVIEWS];
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

    const response: ReviewListResponse = {
      content,
      totalCount,
      totalPages,
      currentPage,
    };

    return HttpResponse.json(response);
  }),
];
