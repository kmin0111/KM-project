import { Suspense, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { Stars } from '@/components';
import {
  useReviewDetail,
  useDeleteReview,
  useCreateOwnerReply,
  useUpdateOwnerReply,
  useDeleteOwnerReply,
} from '@/features/reviews/detail';
import type { RatingBreakdown } from '@/features/reviews/detail';

const BREAKDOWN_LABELS: Array<{ key: keyof RatingBreakdown; label: string }> = [
  { key: 'thoroughness', label: '꼼꼼함' },
  { key: 'punctuality', label: '시간준수' },
  { key: 'kindness', label: '친절도' },
  { key: 'satisfaction', label: '가격만족' },
];

function ReviewDetailSkeleton() {
  return (
    <div className="max-w-container mx-auto px-6 py-10">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-6 w-32 bg-bg-muted rounded" />
        <div className="h-20 w-full bg-bg-muted rounded" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-bg-muted rounded" />
          <div className="h-48 bg-bg-muted rounded" />
        </div>
        <div className="h-32 bg-bg-muted rounded" />
      </div>
    </div>
  );
}

function ReviewDetailContent({ reviewId }: { reviewId: number }) {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const { data } = useReviewDetail(reviewId);
  const deleteReview = useDeleteReview();
  const createReply = useCreateOwnerReply(reviewId);
  const updateReply = useUpdateOwnerReply(reviewId);
  const deleteReply = useDeleteOwnerReply(reviewId);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [replyMode, setReplyMode] = useState<'idle' | 'create' | 'edit'>('idle');
  const [replyDraft, setReplyDraft] = useState('');

  // 다른 후기로 이동했을 때 photoIndex 리셋
  // (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [trackedReviewId, setTrackedReviewId] = useState(data.id);
  if (trackedReviewId !== data.id) {
    setTrackedReviewId(data.id);
    setPhotoIndex(0);
  }

  // 라이트박스 열려있을 때 Esc 키로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxUrl]);

  const isAuthor = isLoggedIn && user?.id === data.authorId;
  const isOwner = isLoggedIn && user?.role === 'OWNER';
  const hasPhotos = data.photos.length > 0;
  const currentPhoto = hasPhotos ? data.photos[photoIndex] : null;

  function handlePrevPhoto() {
    if (!data) return;
    setPhotoIndex((prev) => (prev === 0 ? data.photos.length - 1 : prev - 1));
  }
  function handleNextPhoto() {
    if (!data) return;
    setPhotoIndex((prev) => (prev === data.photos.length - 1 ? 0 : prev + 1));
  }

  function handleDeleteReview() {
    if (!confirm('정말 이 후기를 삭제하시겠습니까?')) return;
    deleteReview.mutate(reviewId, {
      onSuccess: () => navigate(ROUTES.REVIEWS),
    });
  }

  function handleStartCreateReply() {
    setReplyMode('create');
    setReplyDraft('');
  }

  function handleStartEditReply() {
    if (!data) return;
    setReplyMode('edit');
    setReplyDraft(data.ownerReply?.content ?? '');
  }

  function handleCancelReply() {
    setReplyMode('idle');
    setReplyDraft('');
  }

  function handleSubmitReply() {
    const content = replyDraft.trim();
    if (!content) return;
    if (replyMode === 'create') {
      createReply.mutate(
        { content },
        {
          onSuccess: () => {
            setReplyMode('idle');
            setReplyDraft('');
          },
        },
      );
    } else if (replyMode === 'edit') {
      updateReply.mutate(
        { content },
        {
          onSuccess: () => {
            setReplyMode('idle');
            setReplyDraft('');
          },
        },
      );
    }
  }

  function handleDeleteReply() {
    if (!confirm('답글을 삭제하시겠습니까?')) return;
    deleteReply.mutate();
  }

  return (
    <div className="max-w-container mx-auto px-6 py-10">
      <div className="mb-6">
        <Link
          to={ROUTES.REVIEWS}
          className="text-sm text-text-body hover:text-primary transition-colors no-underline"
        >
          &lt; 목록으로
        </Link>
      </div>

      <section className="border border-border-base rounded-xl p-6 mb-6 bg-bg-base">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-muted overflow-hidden flex items-center justify-center text-text-muted text-sm">
              {data.authorProfileUrl ? (
                <img
                  src={data.authorProfileUrl}
                  alt={`${data.author} 프로필`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{data.author.slice(0, 1)}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-semibold text-text-heading">
                  {data.author}
                </span>
                <span className="inline-flex items-center bg-bg-muted text-text-body rounded-full px-2 py-0.5 text-xs font-medium">
                  {data.useCount}회
                </span>
                <span className="text-xs font-semibold text-primary">
                  [{data.type}]
                </span>
              </div>
              <span className="text-xs text-text-muted">{data.createdAt}</span>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`${ROUTES.REVIEWS}/${reviewId}/edit`)}
                className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={deleteReview.isPending}
                className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border border-border-base rounded-xl p-6 bg-bg-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-heading m-0">
              항목별 평가
            </h2>
            <div className="flex items-center gap-2">
              <Stars rating={data.rating} />
              <span className="text-sm font-semibold text-text-heading">
                {data.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {BREAKDOWN_LABELS.map(({ key, label }) => {
              const score = data.ratingBreakdown[key];
              const pct = (score / 5) * 100;
              return (
                <li key={key} className="flex items-center gap-3">
                  <span className="text-sm text-text-body w-20 shrink-0">
                    {label}
                  </span>
                  <div
                    className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={`${label} 평가`}
                  >
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-text-heading w-8 text-right">
                    {score.toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border border-border-base rounded-xl p-6 bg-bg-base">
          <h2 className="text-base font-semibold text-text-heading m-0 mb-4">
            전/후 사진
          </h2>
          {!hasPhotos || !currentPhoto ? (
            <div className="h-48 flex items-center justify-center text-text-muted text-sm">
              등록된 사진이 없습니다.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <figure className="flex flex-col gap-2 m-0">
                  <figcaption className="text-xs font-semibold text-text-muted">
                    BEFORE
                  </figcaption>
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(currentPhoto.beforeUrl)}
                    className="block w-full aspect-[3/2] overflow-hidden rounded-lg bg-bg-muted cursor-zoom-in border-0 p-0"
                    aria-label="전 사진 확대 보기"
                  >
                    <img
                      src={currentPhoto.beforeUrl}
                      alt="청소 전"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </figure>
                <figure className="flex flex-col gap-2 m-0">
                  <figcaption className="text-xs font-semibold text-primary">
                    AFTER
                  </figcaption>
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(currentPhoto.afterUrl)}
                    className="block w-full aspect-[3/2] overflow-hidden rounded-lg bg-bg-muted cursor-zoom-in border-0 p-0"
                    aria-label="후 사진 확대 보기"
                  >
                    <img
                      src={currentPhoto.afterUrl}
                      alt="청소 후"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </figure>
              </div>

              {data.photos.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="w-8 h-8 flex items-center justify-center border border-border-base rounded-full text-text-body hover:bg-bg-muted transition-colors"
                    aria-label="이전 사진"
                  >
                    &lt;
                  </button>
                  <span className="text-sm text-text-body">
                    {photoIndex + 1} / {data.photos.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="w-8 h-8 flex items-center justify-center border border-border-base rounded-full text-text-body hover:bg-bg-muted transition-colors"
                    aria-label="다음 사진"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="border border-border-base rounded-xl p-6 mb-6 bg-bg-base">
        <h2 className="text-base font-semibold text-text-heading m-0 mb-3">
          후기 본문
        </h2>
        <p className="text-sm text-text-body leading-relaxed whitespace-pre-wrap m-0">
          {data.content}
        </p>
      </section>

      <section className="border border-dashed border-border-base rounded-xl p-6 bg-bg-muted/40">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-heading m-0">
            사장님 답글
          </h2>
          {isOwner && replyMode === 'idle' && (
            <div className="flex items-center gap-2">
              {data.ownerReply ? (
                <>
                  <button
                    type="button"
                    onClick={handleStartEditReply}
                    className="border border-border-base text-text-body hover:bg-bg-base rounded-lg px-3 py-1.5 text-sm transition-colors"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteReply}
                    disabled={deleteReply.isPending}
                    className="border border-border-base text-text-body hover:bg-bg-base rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCreateReply}
                  className="bg-primary text-text-inverse hover:bg-primary-700 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                >
                  답글 작성
                </button>
              )}
            </div>
          )}
        </div>

        {replyMode !== 'idle' ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder="고객님께 전달할 답글을 작성해주세요."
              className="w-full min-h-[100px] border border-border-base rounded-lg p-3 text-sm text-text-body bg-bg-base focus:outline-none focus:border-primary resize-y"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelReply}
                className="border border-border-base text-text-body hover:bg-bg-base rounded-lg px-4 py-2 text-sm transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={
                  !replyDraft.trim() ||
                  createReply.isPending ||
                  updateReply.isPending
                }
                className="bg-primary text-text-inverse hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>
        ) : data.ownerReply ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-body leading-relaxed whitespace-pre-wrap m-0">
              {data.ownerReply.content}
            </p>
            <span className="text-xs text-text-muted">
              {data.ownerReply.updatedAt
                ? `${data.ownerReply.updatedAt} (수정됨)`
                : data.ownerReply.createdAt}
            </span>
          </div>
        ) : (
          <p className="text-sm text-text-muted m-0">아직 답글이 없습니다.</p>
        )}
      </section>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label="사진 확대 보기"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxUrl(null);
            }}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-base text-text-heading hover:bg-bg-muted transition-colors"
            aria-label="닫기"
          >
            &times;
          </button>
          <img
            src={lightboxUrl}
            alt="확대된 사진"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);

  if (!Number.isFinite(reviewId) || reviewId <= 0) {
    return (
      <div className="max-w-container mx-auto px-6 py-10">
        <p className="text-text-muted">잘못된 후기 ID입니다.</p>
        <Link to={ROUTES.REVIEWS} className="text-primary underline">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<ReviewDetailSkeleton />}>
      <ReviewDetailContent reviewId={reviewId} />
    </Suspense>
  );
}
