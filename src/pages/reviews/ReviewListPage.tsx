import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { Stars } from '@/components';
import { useReviewList } from '@/features/reviews/list';
import type {
  ReviewFilterType,
  ReviewServiceType,
  ReviewSort,
} from '@/features/reviews/list';

const FILTER_TABS: ReviewFilterType[] = ['전체', '정기청소', '입주청소', '특수청소'];
const PAGE_SIZE = 10;

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const range: (number | '...')[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  range.push(total);
  return range;
}

export function ReviewListPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [filter, setFilter] = useState<ReviewFilterType>('전체');
  const [sort, setSort] = useState<ReviewSort>('latest');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort,
      ...(filter !== '전체' ? { type: filter as ReviewServiceType } : {}),
    }),
    [page, sort, filter],
  );

  const { data, isLoading, isError, refetch } = useReviewList(queryParams);

  function handleFilterChange(next: ReviewFilterType) {
    setFilter(next);
    setPage(1);
  }

  function handleSortChange(next: ReviewSort) {
    setSort(next);
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleWriteClick() {
    if (isLoggedIn) {
      navigate(ROUTES.REVIEWS_WRITE);
    } else {
      navigate(ROUTES.LOGIN);
    }
  }

  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const reviews = data?.content ?? [];

  return (
    <div className="max-w-container mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-heading m-0">
          전체 후기 ({totalCount}건)
        </h1>
        <div className="flex items-center gap-3">
          {/* TODO: 디자인 시스템 Dropdown 컴포넌트로 교체 예정 */}
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as ReviewSort)}
            aria-label="정렬 기준"
            className="border border-border-base rounded-lg px-3 py-2 text-sm text-text-body bg-bg-base focus:outline-none focus:border-primary"
          >
            <option value="latest">최신순</option>
            <option value="rating">별점순</option>
          </select>
          <button
            type="button"
            onClick={handleWriteClick}
            className="bg-primary text-text-inverse rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            후기 작성
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {FILTER_TABS.map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleFilterChange(tab)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'bg-primary text-text-inverse rounded-full px-4 py-2 text-sm font-semibold'
                  : 'border border-border-base text-text-body hover:bg-bg-muted rounded-full px-4 py-2 text-sm font-medium transition-colors'
              }
            >
              {tab}
            </button>
          );
        })}
      </div>

      {isError ? (
        <div className="border border-border-base rounded-xl p-10 text-center">
          <p className="text-text-muted mb-4">후기를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-4 py-2 text-sm transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <div
              key={i}
              className="border border-border-base rounded-xl p-5 flex flex-col gap-3 animate-pulse"
            >
              <div className="h-4 w-20 bg-bg-muted rounded" />
              <div className="h-4 w-24 bg-bg-muted rounded" />
              <div className="h-4 w-full bg-bg-muted rounded" />
              <div className="h-4 w-5/6 bg-bg-muted rounded" />
              <div className="h-3 w-32 bg-bg-muted rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="border border-border-base rounded-xl p-10 text-center text-text-muted">
          등록된 후기가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              to={`${ROUTES.REVIEWS}/${review.id}`}
              className="text-left border border-border-base rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow bg-bg-base no-underline"
            >
              <span className="text-[13px] font-semibold text-primary">
                [{review.type}]
              </span>
              <Stars rating={review.rating} />
              <p className="text-[13px] text-text-body leading-relaxed m-0 line-clamp-2">
                {review.content}
              </p>
              <div className="flex items-center justify-between text-xs text-text-muted mt-auto">
                <span>
                  {review.author} · {review.useCount}회이용
                </span>
                <span>{review.createdAt}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8" aria-label="페이지네이션">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          {getPageRange(page, totalPages).map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-2 text-sm text-text-muted"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePageChange(p)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'bg-primary text-text-inverse rounded-lg px-3 py-2 text-sm font-semibold min-w-[40px]'
                    : 'border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-3 py-2 text-sm min-w-[40px] transition-colors'
                }
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
