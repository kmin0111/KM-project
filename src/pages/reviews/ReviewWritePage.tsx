import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { StarRating, PhotoPreview, PhotoAddButton } from '@/components';
import {
  useCreateReview,
  useUpdateReview,
  type ReviewPhotoPayload,
} from '@/features/reviews/create';
import { reviewDetailOptions } from '@/features/reviews/detail';
import type { RatingBreakdown } from '@/features/reviews/detail';
import type { ReviewServiceType } from '@/features/reviews/list';

const SERVICE_TYPES: ReviewServiceType[] = ['정기청소', '입주청소', '특수청소'];

const BREAKDOWN_LABELS: Array<{ key: keyof RatingBreakdown; label: string }> = [
  { key: 'thoroughness', label: '꼼꼼함' },
  { key: 'punctuality', label: '시간준수' },
  { key: 'kindness', label: '친절도' },
  { key: 'satisfaction', label: '가격만족도' },
];

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 500;
const MIN_CONTENT_LENGTH = 10;

function emptyBreakdown(): RatingBreakdown {
  return {
    thoroughness: 0,
    punctuality: 0,
    kindness: 0,
    satisfaction: 0,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * 서버 에러 응답에서 사람이 읽을 수 있는 메시지를 추출한다.
 * 실패 시 fallback 메시지를 반환한다.
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
}

export function ReviewWritePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const editId = id ? Number(id) : null;
  const isEditMode = editId !== null && Number.isFinite(editId) && editId > 0;

  // 수정 모드: 기존 데이터 조회. editId가 있을 때만 enabled가 true가 되므로
  // editId가 null이어도 안전하게 훅을 호출할 수 있다.
  const detailQuery = useQuery({
    ...reviewDetailOptions(isEditMode ? (editId as number) : 0),
    enabled: isEditMode && isLoggedIn,
  });

  const [type, setType] = useState<ReviewServiceType | null>(null);
  const [breakdown, setBreakdown] = useState<RatingBreakdown>(emptyBreakdown);
  const [content, setContent] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // 수정 모드: 상세 데이터가 도착하면 폼 상태를 한 번만 동기화한다.
  // 추적용 id를 비교하여 같은 id로 재실행되지 않도록 한다.
  const [hydratedFromId, setHydratedFromId] = useState<number | null>(null);
  if (isEditMode && detailQuery.data && hydratedFromId !== detailQuery.data.id) {
    const data = detailQuery.data;
    setHydratedFromId(data.id);
    setType(data.type);
    setBreakdown(data.ratingBreakdown);
    setContent(data.content);
    setBeforePhotos(data.photos.map((p) => p.beforeUrl).filter(Boolean));
    setAfterPhotos(data.photos.map((p) => p.afterUrl).filter(Boolean));
  }

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const errors = useMemo(() => {
    return {
      type: !type ? '서비스 유형을 선택해주세요.' : null,
      breakdown:
        breakdown.thoroughness === 0 ||
        breakdown.punctuality === 0 ||
        breakdown.kindness === 0 ||
        breakdown.satisfaction === 0
          ? '모든 항목의 별점을 선택해주세요.'
          : null,
      content:
        content.trim().length < MIN_CONTENT_LENGTH
          ? `후기 내용은 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요.`
          : null,
    };
  }, [type, breakdown, content]);

  const hasError = !!(errors.type || errors.breakdown || errors.content);

  // 비로그인 시 렌더 단에서 로그인 페이지로 리다이렉트.
  // (라우터 가드인 RequireAuth와 이중 안전망 역할 — 모든 훅 호출 이후)
  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  function handleBreakdownChange(key: keyof RatingBreakdown, value: number) {
    setBreakdown((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePhotoAdd(slot: 'before' | 'after', file: File | null) {
    if (!file) return;
    setPhotoError(null);

    const setter = slot === 'before' ? setBeforePhotos : setAfterPhotos;
    const current = slot === 'before' ? beforePhotos : afterPhotos;

    if (current.length >= MAX_PHOTOS) {
      setPhotoError(
        `${slot === 'before' ? '전' : '후'} 사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`,
      );
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('jpg 또는 png 형식의 이미지만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    // TODO(prod): 실제 환경에서는 다음 흐름으로 교체한다.
    //   1) POST /api/v1/files/presigned 로 presigned URL 발급
    //   2) presigned URL에 file을 PUT 업로드
    //   3) 업로드된 S3/CDN URL을 setter에 저장
    // mock 환경에서는 dataURL을 그대로 유지하여 미리보기/전송에 사용한다.
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setter((prev) => [...prev, dataUrl]);
    } catch {
      setPhotoError('이미지를 불러오지 못했습니다. 다시 시도해주세요.');
    }
  }

  function handlePhotoRemove(slot: 'before' | 'after', index: number) {
    const setter = slot === 'before' ? setBeforePhotos : setAfterPhotos;
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  /**
   * 전/후 사진을 페어로 묶어 payload를 만든다.
   * 한쪽만 있는 경우 해당 필드만 채우고, 양쪽 모두 비어 있으면 항목 자체를 제외한다.
   */
  function buildPayload(): ReviewPhotoPayload[] {
    const len = Math.max(beforePhotos.length, afterPhotos.length);
    const result: ReviewPhotoPayload[] = [];
    for (let i = 0; i < len; i += 1) {
      const before = beforePhotos[i];
      const after = afterPhotos[i];
      if (!before && !after) continue;
      const entry: ReviewPhotoPayload = {};
      if (before) entry.beforeUrl = before;
      if (after) entry.afterUrl = after;
      result.push(entry);
    }
    return result;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (hasError || !type) return;

    const body = {
      type,
      ratingBreakdown: breakdown,
      content: content.trim(),
      photos: buildPayload(),
    };

    if (isEditMode && editId) {
      updateMutation.mutate(
        { id: editId, body },
        { onSuccess: () => navigate(`${ROUTES.REVIEWS}/${editId}`) },
      );
    } else {
      createMutation.mutate(body, {
        onSuccess: () => navigate(ROUTES.REVIEWS),
      });
    }
  }

  function handleCancel() {
    if (isPending) return;
    if (isEditMode && editId) {
      navigate(`${ROUTES.REVIEWS}/${editId}`);
    } else {
      navigate(ROUTES.REVIEWS);
    }
  }

  // 수정 모드 로딩 중
  if (isEditMode && detailQuery.isLoading) {
    return (
      <div className="max-w-container mx-auto px-6 py-10">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-40 bg-bg-muted rounded" />
          <div className="h-32 w-full bg-bg-muted rounded" />
          <div className="h-48 w-full bg-bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (isEditMode && detailQuery.isError) {
    return (
      <div className="max-w-container mx-auto px-6 py-10">
        <p className="text-text-muted mb-4">후기를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.REVIEWS)}
          className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-4 py-2 text-sm transition-colors"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-text-heading m-0 mb-8">
        {isEditMode ? '후기 수정' : '후기 작성'}
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        {/* 서비스 유형 */}
        <section
          className="border border-border-base rounded-xl p-6 bg-bg-base"
          aria-labelledby="section-type"
        >
          <h2
            id="section-type"
            className="text-base font-semibold text-text-heading m-0 mb-4"
          >
            서비스 유형 <span className="text-error">*</span>
          </h2>
          <div className="flex gap-2 flex-wrap" role="radiogroup">
            {SERVICE_TYPES.map((t) => {
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setType(t)}
                  className={
                    active
                      ? 'bg-primary text-text-inverse border border-primary rounded-full px-5 py-2 text-sm font-semibold transition-colors'
                      : 'border border-border-base text-text-body bg-bg-base hover:border-primary hover:text-primary rounded-full px-5 py-2 text-sm font-medium transition-colors'
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
          <p
            className="text-error text-xs mt-2 m-0 min-h-[20px]"
            role="alert"
          >
            {submitted && errors.type ? errors.type : ' '}
          </p>
        </section>

        {/* 항목별 별점 */}
        <section
          className="border border-border-base rounded-xl p-6 bg-bg-base"
          aria-labelledby="section-breakdown"
        >
          <h2
            id="section-breakdown"
            className="text-base font-semibold text-text-heading m-0 mb-4"
          >
            항목별 별점 <span className="text-error">*</span>
          </h2>
          <div className="flex flex-col gap-4">
            {BREAKDOWN_LABELS.map(({ key, label }) => (
              <StarRating
                key={key}
                label={label}
                value={breakdown[key]}
                onChange={(v) => handleBreakdownChange(key, v)}
              />
            ))}
          </div>
          <p
            className="text-error text-xs mt-3 m-0 min-h-[20px]"
            role="alert"
          >
            {submitted && errors.breakdown ? errors.breakdown : ' '}
          </p>
        </section>

        {/* 후기 내용 */}
        <section
          className="border border-border-base rounded-xl p-6 bg-bg-base"
          aria-labelledby="section-content"
        >
          <h2
            id="section-content"
            className="text-base font-semibold text-text-heading m-0 mb-4"
          >
            후기 내용 <span className="text-error">*</span>
          </h2>
          <textarea
            value={content}
            maxLength={MAX_CONTENT_LENGTH}
            onChange={(e) => setContent(e.target.value)}
            placeholder="청소 서비스에 대한 솔직한 후기를 작성해주세요. (최소 10자)"
            className="w-full min-h-[160px] border border-border-base rounded-lg p-3 text-sm text-text-body bg-bg-base focus:outline-none focus:border-primary resize-y"
            aria-invalid={submitted && !!errors.content}
            aria-describedby="content-counter"
          />
          <div className="flex items-center justify-between mt-2 min-h-[20px]">
            <p className="text-error text-xs m-0" role="alert">
              {submitted && errors.content ? errors.content : ' '}
            </p>
            <span id="content-counter" className="text-xs text-text-muted">
              {content.length}/{MAX_CONTENT_LENGTH}자
            </span>
          </div>
        </section>

        {/* 사진 업로드 */}
        <section
          className="border border-border-base rounded-xl p-6 bg-bg-base"
          aria-labelledby="section-photos"
        >
          <h2
            id="section-photos"
            className="text-base font-semibold text-text-heading m-0 mb-1"
          >
            사진 업로드{' '}
            <span className="text-xs font-normal text-text-muted ml-1">
              (선택, 전/후 각 최대 {MAX_PHOTOS}장)
            </span>
          </h2>
          <p className="text-xs text-text-muted m-0 mb-4">
            jpg 또는 png, 5MB 이하
          </p>

          {photoError && (
            <p className="text-error text-xs m-0 mb-3" role="alert">
              {photoError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* 전 사진 */}
            <div>
              <p className="text-sm font-semibold text-text-muted m-0 mb-3">
                전 사진{' '}
                <span className="font-normal text-text-muted">
                  ({beforePhotos.length}/{MAX_PHOTOS})
                </span>
              </p>
              <div className="flex flex-col gap-2">
                {beforePhotos.map((url, idx) => (
                  <PhotoPreview
                    key={`${idx}-${url.slice(-12)}`}
                    url={url}
                    onClear={() => handlePhotoRemove('before', idx)}
                  />
                ))}
                {beforePhotos.length < MAX_PHOTOS && (
                  <PhotoAddButton
                    label="전 사진 추가"
                    onChange={(file) => handlePhotoAdd('before', file)}
                  />
                )}
              </div>
            </div>

            {/* 후 사진 */}
            <div>
              <p className="text-sm font-semibold text-primary m-0 mb-3">
                후 사진{' '}
                <span className="font-normal text-text-muted">
                  ({afterPhotos.length}/{MAX_PHOTOS})
                </span>
              </p>
              <div className="flex flex-col gap-2">
                {afterPhotos.map((url, idx) => (
                  <PhotoPreview
                    key={`${idx}-${url.slice(-12)}`}
                    url={url}
                    onClear={() => handlePhotoRemove('after', idx)}
                  />
                ))}
                {afterPhotos.length < MAX_PHOTOS && (
                  <PhotoAddButton
                    label="후 사진 추가"
                    onChange={(file) => handlePhotoAdd('after', file)}
                    accent
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 제출 실패 시 서버 에러 메시지 */}
        {mutationError && (
          <p
            className="text-error text-sm m-0 px-4 py-3 bg-error-bg rounded-lg"
            role="alert"
          >
            {extractErrorMessage(
              mutationError,
              isEditMode
                ? '후기 수정에 실패했습니다. 다시 시도해주세요.'
                : '후기 등록에 실패했습니다. 다시 시도해주세요.',
            )}
          </p>
        )}

        {/* 액션 */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-text-inverse hover:bg-primary-700 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? isEditMode
                ? '수정 중...'
                : '등록 중...'
              : isEditMode
                ? '수정 완료'
                : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
