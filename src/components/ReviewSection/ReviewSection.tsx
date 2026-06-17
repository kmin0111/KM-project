import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Stars } from '@/components';
import { useReviewList } from '@/features/reviews/list';

export function ReviewSection() {
  const { data, isLoading } = useReviewList({ page: 1, size: 3, sort: 'latest' });

  return (
    <section className="py-[60px] px-6 bg-bg-base">
      <div className="max-w-container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-heading m-0">고객 후기</h2>
          <Link
            to={ROUTES.REVIEWS}
            className="text-sm text-text-body no-underline hover:text-text-heading transition-colors"
          >
            전체보기 →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border-base rounded-xl p-5 flex flex-col gap-2 animate-pulse"
                >
                  <div className="h-4 w-16 bg-bg-muted rounded" />
                  <div className="h-4 w-24 bg-bg-muted rounded" />
                  <div className="h-10 w-full bg-bg-muted rounded" />
                  <div className="h-3 w-20 bg-bg-muted rounded mt-auto" />
                </div>
              ))
            : data?.content.map((review) => (
                <Link
                  key={review.id}
                  to={`${ROUTES.REVIEWS}/${review.id}`}
                  className="border border-border-base rounded-xl p-5 flex flex-col gap-2 no-underline hover:shadow-md transition-shadow"
                >
                  <span className="text-[13px] font-semibold text-primary">
                    [{review.type}]
                  </span>
                  <Stars rating={review.rating} />
                  <p className="text-[13px] text-text-body leading-relaxed m-0 line-clamp-2">
                    {review.content}
                  </p>
                  <p className="text-xs text-text-muted m-0 mt-auto">
                    {review.author} · {review.useCount}회이용
                  </p>
                </Link>
              ))}
        </div>

        <div className="border border-border-base rounded-lg p-4 text-center text-[15px] text-gray-600">
          전체 평균 &nbsp;•&nbsp;{' '}
          <strong className="text-lg text-text-heading">
            {isLoading ? '-' : (data?.averageRating ?? 0).toFixed(1)}
          </strong>
          &nbsp;({isLoading ? '-' : data?.totalCount ?? 0}건)
        </div>
      </div>
    </section>
  );
}
