import { http, HttpResponse } from 'msw';
import { mockReviewStore } from '../shared/mockStore';
import type { RatingBreakdown, ReviewPhoto } from '../detail/types';
import type {
  CreateReviewRequest,
  CreateReviewResponse,
  ReviewPhotoPayload,
  UpdateReviewRequest,
  UpdateReviewResponse,
} from './types';

const MIN_CONTENT_LENGTH = 10;
const BREAKDOWN_ITEM_COUNT = 4;

/** mock 환경에서 작성한 후기에 부여할 가상의 작성자 정보 */
const MOCK_AUTHOR = {
  id: 1,
  name: '나',
} as const;

function requireAuth(request: Request) {
  const auth = request.headers.get('Authorization');
  if (!auth) {
    return HttpResponse.json(
      { message: '인증이 필요합니다.' },
      { status: 401 },
    );
  }
  return null;
}

function averageRating(breakdown: RatingBreakdown): number {
  const sum =
    breakdown.thoroughness +
    breakdown.punctuality +
    breakdown.kindness +
    breakdown.satisfaction;
  return Math.round((sum / BREAKDOWN_ITEM_COUNT) * 10) / 10;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 빈 URL 페어를 제거하고, 한쪽만 채워진 경우도 그대로 보존한다. */
function sanitizePhotos(photos: ReviewPhotoPayload[] | undefined): ReviewPhoto[] {
  if (!photos) return [];
  return photos
    .map((p) => ({
      beforeUrl: p.beforeUrl?.trim() ?? '',
      afterUrl: p.afterUrl?.trim() ?? '',
    }))
    .filter((p) => p.beforeUrl !== '' || p.afterUrl !== '')
    .map((p, idx) => {
      const photo: ReviewPhoto = { id: idx + 1, beforeUrl: '', afterUrl: '' };
      if (p.beforeUrl !== '') photo.beforeUrl = p.beforeUrl;
      if (p.afterUrl !== '') photo.afterUrl = p.afterUrl;
      return photo;
    });
}

/**
 * 작성/수정 요청 본문의 공통 유효성 검증.
 * 위반 시 400 응답을 반환하고, 통과하면 null을 반환한다.
 */
function validateReviewBody(
  body: CreateReviewRequest | UpdateReviewRequest,
): Response | null {
  if (!body.type) {
    return HttpResponse.json(
      { message: '서비스 유형을 선택해주세요.' },
      { status: 400 },
    );
  }
  if (
    !body.ratingBreakdown ||
    body.ratingBreakdown.thoroughness < 1 ||
    body.ratingBreakdown.punctuality < 1 ||
    body.ratingBreakdown.kindness < 1 ||
    body.ratingBreakdown.satisfaction < 1
  ) {
    return HttpResponse.json(
      { message: '모든 항목의 별점을 선택해주세요.' },
      { status: 400 },
    );
  }
  if (!body.content || body.content.trim().length < MIN_CONTENT_LENGTH) {
    return HttpResponse.json(
      { message: `후기 내용은 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.` },
      { status: 400 },
    );
  }
  return null;
}

export const reviewCreateHandlers = [
  http.post('/api/v1/reviews', async ({ request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as CreateReviewRequest;
    const invalid = validateReviewBody(body);
    if (invalid) return invalid;

    const id = mockReviewStore.takeNextReviewId();
    const photos = sanitizePhotos(body.photos);
    const rating = averageRating(body.ratingBreakdown);
    const createdAt = todayString();

    const response: CreateReviewResponse = {
      id,
      type: body.type,
      rating,
      ratingBreakdown: body.ratingBreakdown,
      content: body.content,
      photos,
      author: MOCK_AUTHOR.name,
      authorId: MOCK_AUTHOR.id,
      useCount: 1,
      createdAt,
    };

    // 목록/상세에서 조회될 수 있도록 store에 반영
    mockReviewStore.addCreatedReview({
      id,
      type: body.type,
      rating,
      content: body.content,
      author: MOCK_AUTHOR.name,
      useCount: 1,
      createdAt,
      ratingBreakdown: body.ratingBreakdown,
      photos,
      authorId: MOCK_AUTHOR.id,
    });

    return HttpResponse.json(response, { status: 201 });
  }),

  http.put('/api/v1/reviews/:id', async ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    const body = (await request.json()) as UpdateReviewRequest;
    const invalid = validateReviewBody(body);
    if (invalid) return invalid;

    const photos = sanitizePhotos(body.photos);
    const rating = averageRating(body.ratingBreakdown);

    mockReviewStore.applyUpdate(id, {
      type: body.type,
      rating,
      ratingBreakdown: body.ratingBreakdown,
      content: body.content,
      photos,
    });

    const response: UpdateReviewResponse = {
      id,
      type: body.type,
      rating,
      ratingBreakdown: body.ratingBreakdown,
      content: body.content,
      photos,
      author: MOCK_AUTHOR.name,
      authorId: MOCK_AUTHOR.id,
      useCount: 1,
      createdAt: todayString(),
    };

    return HttpResponse.json(response);
  }),
];
