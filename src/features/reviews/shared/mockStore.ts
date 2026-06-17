/**
 * 리뷰 mock 핸들러 간 공유되는 module-level 상태.
 *
 * - createdReviews: 사용자가 작성한 후기 목록 (list/detail 응답에 합쳐짐)
 * - updatedReviews: 사용자가 수정한 후기 덮어쓰기 정보 (id → patch)
 * - deletedReviewIds: 삭제 처리된 후기 id 집합
 * - ownerReplies: 사장님 답글 (review id → reply)
 * - 카운터: 다음 review id, 다음 reply id
 *
 * HMR 도중 module-level 변수가 재초기화되어도 sessionStorage에서 복원한다.
 * 새 세션을 시작하면 초기값으로 돌아간다.
 */

import type { OwnerReply, ReviewDetail, ReviewPhoto } from '../detail/types';
import type { Review } from '../list/types';

const STORAGE_KEY = 'mock:reviews';
const INITIAL_NEXT_REVIEW_ID = 1000;
const INITIAL_NEXT_REPLY_ID = 100;

interface PersistedShape {
  createdReviews: CreatedReview[];
  updatedReviews: Record<number, UpdatedReviewPatch>;
  deletedReviewIds: number[];
  ownerReplies: Record<number, OwnerReply>;
  nextReviewId: number;
  nextReplyId: number;
}

/**
 * 사용자가 mock 환경에서 작성한 후기.
 * list 응답에 사용할 수 있도록 Review 형태를 포함하면서,
 * detail 응답에 필요한 추가 정보(ratingBreakdown, photos 등)도 함께 들고 있다.
 */
export interface CreatedReview extends Review {
  ratingBreakdown: ReviewDetail['ratingBreakdown'];
  photos: ReviewPhoto[];
  authorId: number;
}

export interface UpdatedReviewPatch {
  type?: Review['type'];
  rating?: number;
  ratingBreakdown?: ReviewDetail['ratingBreakdown'];
  content?: string;
  photos?: ReviewPhoto[];
}

function readPersisted(): PersistedShape | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedShape;
  } catch {
    return null;
  }
}

function writePersisted(state: PersistedShape) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy errors
  }
}

const persisted = readPersisted();

const createdReviews: CreatedReview[] = persisted?.createdReviews ?? [];
const updatedReviews = new Map<number, UpdatedReviewPatch>(
  persisted ? Object.entries(persisted.updatedReviews).map(([k, v]) => [Number(k), v]) : [],
);
const deletedReviewIds = new Set<number>(persisted?.deletedReviewIds ?? []);
const ownerReplies = new Map<number, OwnerReply>(
  persisted
    ? Object.entries(persisted.ownerReplies).map(([k, v]) => [Number(k), v])
    : [
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
      ],
);

let nextReviewId = persisted?.nextReviewId ?? INITIAL_NEXT_REVIEW_ID;
let nextReplyId = persisted?.nextReplyId ?? INITIAL_NEXT_REPLY_ID;

function persist() {
  writePersisted({
    createdReviews,
    updatedReviews: Object.fromEntries(updatedReviews),
    deletedReviewIds: Array.from(deletedReviewIds),
    ownerReplies: Object.fromEntries(ownerReplies),
    nextReviewId,
    nextReplyId,
  });
}

export const mockReviewStore = {
  // ===== created reviews =====
  getCreatedReviews(): CreatedReview[] {
    return [...createdReviews];
  },
  addCreatedReview(review: CreatedReview) {
    createdReviews.unshift(review);
    persist();
  },
  findCreatedReview(id: number): CreatedReview | undefined {
    return createdReviews.find((r) => r.id === id);
  },

  // ===== updates =====
  applyUpdate(id: number, patch: UpdatedReviewPatch) {
    const existing = updatedReviews.get(id) ?? {};
    updatedReviews.set(id, { ...existing, ...patch });
    // created에 속한다면 in-place 업데이트도 수행
    const created = createdReviews.find((r) => r.id === id);
    if (created) {
      if (patch.type !== undefined) created.type = patch.type;
      if (patch.rating !== undefined) created.rating = patch.rating;
      if (patch.ratingBreakdown !== undefined)
        created.ratingBreakdown = patch.ratingBreakdown;
      if (patch.content !== undefined) created.content = patch.content;
      if (patch.photos !== undefined) created.photos = patch.photos;
    }
    persist();
  },
  getUpdate(id: number): UpdatedReviewPatch | undefined {
    return updatedReviews.get(id);
  },

  // ===== deletes =====
  markDeleted(id: number) {
    deletedReviewIds.add(id);
    ownerReplies.delete(id);
    persist();
  },
  isDeleted(id: number): boolean {
    return deletedReviewIds.has(id);
  },

  // ===== owner replies =====
  getReply(id: number): OwnerReply | undefined {
    return ownerReplies.get(id);
  },
  setReply(id: number, reply: OwnerReply) {
    ownerReplies.set(id, reply);
    persist();
  },
  deleteReply(id: number) {
    ownerReplies.delete(id);
    persist();
  },

  // ===== counters =====
  takeNextReviewId(): number {
    const id = nextReviewId++;
    persist();
    return id;
  },
  takeNextReplyId(): number {
    const id = nextReplyId++;
    persist();
    return id;
  },
};
