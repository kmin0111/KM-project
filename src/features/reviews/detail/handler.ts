import { http, HttpResponse } from 'msw';
import { MOCK_REVIEWS } from '../list/mockData';
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

const ownerReplies = new Map<number, OwnerReply>([
  [
    1,
    {
      id: 1,
      content:
        '소중한 후기 감사합니다! 앞으로도 변함없는 서비스로 보답드리겠습니다.',
      createdAt: '2025-05-21',
    },
  ],
  [
    3,
    {
      id: 2,
      content: '만족스러운 서비스를 제공해드릴 수 있어 기쁩니다. 감사합니다!',
      createdAt: '2025-05-16',
    },
  ],
]);

let nextReplyId = 100;
const deletedReviews = new Set<number>();

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
    if (deletedReviews.has(id)) {
      return HttpResponse.json({ message: '존재하지 않는 후기입니다.' }, { status: 404 });
    }

    const base = MOCK_REVIEWS.find((r) => r.id === id);
    if (!base) {
      return HttpResponse.json({ message: '존재하지 않는 후기입니다.' }, { status: 404 });
    }

    const detail: ReviewDetail = {
      id: base.id,
      type: base.type,
      rating: base.rating,
      ratingBreakdown: buildBreakdown(base.rating),
      content: base.content,
      author: base.author,
      authorId: buildAuthorId(base.id),
      useCount: base.useCount,
      createdAt: base.createdAt,
      photos: buildPhotos(base.id),
      ownerReply: ownerReplies.get(id),
    };

    return HttpResponse.json(detail);
  }),

  http.delete('/api/v1/reviews/:id', ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    deletedReviews.add(id);
    ownerReplies.delete(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/v1/reviews/:id/reply', async ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    const body = (await request.json()) as CreateReplyRequest;
    const now = new Date().toISOString().slice(0, 10);
    const reply: OwnerReply = {
      id: nextReplyId++,
      content: body.content,
      createdAt: now,
    };
    ownerReplies.set(id, reply);
    return HttpResponse.json(reply, { status: 201 });
  }),

  http.put('/api/v1/reviews/:id/reply', async ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    const body = (await request.json()) as UpdateReplyRequest;
    const existing = ownerReplies.get(id);
    if (!existing) {
      return HttpResponse.json({ message: '답글이 존재하지 않습니다.' }, { status: 404 });
    }
    const now = new Date().toISOString().slice(0, 10);
    const updated: OwnerReply = {
      ...existing,
      content: body.content,
      updatedAt: now,
    };
    ownerReplies.set(id, updated);
    return HttpResponse.json(updated);
  }),

  http.delete('/api/v1/reviews/:id/reply', ({ params, request }) => {
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = Number(params.id);
    ownerReplies.delete(id);
    return new HttpResponse(null, { status: 204 });
  }),
];
