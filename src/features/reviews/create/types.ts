import type { RatingBreakdown, ReviewPhoto } from '../detail/types';
import type { ReviewServiceType } from '../list/types';

/**
 * 후기 작성/수정 페이지에서 사용하는 사진 페이로드.
 *
 * mock 환경에서는 실제 파일 업로드 인프라가 없으므로 base64 dataURL을
 * 그대로 보내고 받는다.
 *
 * 운영 환경에서는 다음 흐름으로 교체되어야 한다:
 *   1) 클라이언트가 파일 선택 → POST /api/v1/files/presigned 로 presigned URL 발급
 *   2) presigned URL에 파일 PUT 업로드
 *   3) 업로드 완료된 S3(또는 CDN) URL을 beforeUrl/afterUrl로 전송
 *
 * 빈 문자열("")은 페어 중 한쪽이 없는 경우를 의미했으나, 새 모델에서는
 * 빈 문자열을 보내지 않고 항목 자체를 누락한다.
 */
export interface ReviewPhotoPayload {
  beforeUrl?: string;
  afterUrl?: string;
}

export interface CreateReviewRequest {
  type: ReviewServiceType;
  ratingBreakdown: RatingBreakdown;
  content: string;
  photos: ReviewPhotoPayload[];
}

export type UpdateReviewRequest = CreateReviewRequest;

export interface CreateReviewResponse {
  id: number;
  type: ReviewServiceType;
  rating: number;
  ratingBreakdown: RatingBreakdown;
  content: string;
  photos: ReviewPhoto[];
  /** 작성자 표시명 (마스킹된 형태) */
  author: string;
  /** 작성자 식별자 — 본인 후기 판정에 사용 */
  authorId: number;
  /** 이 작성자의 누적 서비스 이용 횟수 (UI 표시용) */
  useCount: number;
  createdAt: string;
}

export type UpdateReviewResponse = CreateReviewResponse;

export interface UpdateReviewArgs {
  id: number;
  body: UpdateReviewRequest;
}
