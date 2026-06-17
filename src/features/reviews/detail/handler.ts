import { http, HttpResponse } from 'msw';
import { MOCK_REVIEWS } from '../list/mockData';
import { mockReviewStore } from '../shared/mockStore';
import type {
  CreateReplyRequest,
  OwnerReply,
  RatingBreakdown,
  ReviewDetail,
  ReviewPhoto,
  UpdateReplyRequest,
} from './types';

function buildBreakdown(rating: number): RatingBreakdown {
  const base = Math.max(1, Math.min(5, rating));
  const jitter = (offset: number) =>
    Math.max(1, Math.min(5, base + offset)) as number;
  return {
    thoroughness: jitter(0),
    punctuality: jitter(rating >= 4 ? 0 : -1),
    kindness: jitter(rating >= 3 ? 0 : 1),
    satisfaction: jitter(rating === 5 ? 0 : -1),
  };
}

function buildPhotos(id: number): ReviewPhoto[] {
  const count = (id % 3) + 1;
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    beforeUrl: `https://picsum.photos/seed/review-${id}-before-${i}/600/400`,
    afterUrl: `https://picsum.photos/seed/review-${id}-after-${i}/600/400`,
  }));
}

// authorId는 후기 id와 독립된 값.
// id 1~5인 후기는 로그인한 USER(id: 1)가 작성한 것으로 간주하여
// 본인 후기 수정/삭제 흐름을 검증할 수 있게 함.
function buildAuthorId(reviewId: number): number {
  if (reviewId >= 1 && reviewId <= 5) return 1;
  // 그 외 후기는 다른 작성자(타인) — 임의의 분산된 id 사용
  return 200 + reviewId;
}

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

export const reviewDetailHandlers = [
  http.get('/api/v1/reviews/:id', ({ params }) => {
    const id = Number(params.id);
    if (mockReviewStore.isDeleted(id)) {
      return HttpResponse.json({ message: '존재하지 않는 후기입니다.' }, { status: 404 });
    }

    // 1) 사용자가 작성한 후기를 우선 조회
    const created = mockReviewStore.findCreatedReview(id);
    if (created) {
      const detail: ReviewDetail = {
        id: created.id,
        type: created.type,
        rating: created.rating,
        ratingBreakdown: created.ratingBreakdown,
        content: created.content,
        author: created.author,
        authorId: created.authorId,
        useCount: created.useCount,
        createdAt: created.createdAt,
        photos: created.photos,
        ownerReply: mockReviewStore.getReply(id),
      };
      return HttpResponse.json(detail);
    }

    // 2) 기본 mock 데이터에서 조회 (수정 patch 반영)
    const base = MOCK_REVIEWS.find((r) => r.id === id);
    if (!base) {
      return HttpResponse.json({ message: '존재하지 않는 후기입니다.' }, { status: 404 });
    }

    const patch = mockReviewStore.getUpdate(id);

    const detail: ReviewDetail = {
      id: base.id,
      type: patch?.type ?? base.type,
      rating: patch?.rating ?? base.rating,
      ratingBreakdown: patch?.ratingBreakdown ?? buildBreakdown(base.rating),
      content: patch?.content ?? base.content,
      author: base.author,
      authorId: buildAuthorId(base.id),
      useCount: base.useCount,
      createdAt: base.createdAt,
      photos: patch?.photos ?? buildPhotos(base.id),
      ownerReply: mockReviewStore.getReply(id),
    };

    return HttpResponse.json(detail);
  }),

  http.delete('/api/v1/reviews/:id', ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    mockReviewStore.markDeleted(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/v1/reviews/:id/reply', async ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    const body = (await request.json()) as CreateReplyRequest;
    const now = new Date().toISOString().slice(0, 10);
    const reply: OwnerReply = {
      id: mockReviewStore.takeNextReplyId(),
      content: body.content,
      createdAt: now,
    };
    mockReviewStore.setReply(id, reply);
    return HttpResponse.json(reply, { status: 201 });
  }),

  http.put('/api/v1/reviews/:id/reply', async ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    const body = (await request.json()) as UpdateReplyRequest;
    const existing = mockReviewStore.getReply(id);
    if (!existing) {
      return HttpResponse.json({ message: '답글이 존재하지 않습니다.' }, { status: 404 });
    }
    const now = new Date().toISOString().slice(0, 10);
    const updated: OwnerReply = {
      ...existing,
      content: body.content,
      updatedAt: now,
    };
    mockReviewStore.setReply(id, updated);
    return HttpResponse.json(updated);
  }),

  http.delete('/api/v1/reviews/:id/reply', ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    mockReviewStore.deleteReply(id);
    return new HttpResponse(null, { status: 204 });
  }),
];
