import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Stars } from '@/components';

const REVIEWS = [
  {
    id: 1,
    type: '정기청소',
    rating: 5,
    preview: '꼼꼼하게 잘 해주셔서 집이 정말 깨끗해졌어요. 다음에도 꼭 이용할게요!',
    author: '김00',
    count: 3,
  },
  {
    id: 2,
    type: '입주청소',
    rating: 4,
    preview: '새 집처럼 깨끗하게 청소해주셨어요. 세세한 부분까지 신경 써주셔서 만족합니다.',
    author: '박00',
    count: 1,
  },
  {
    id: 3,
    type: '특수청소',
    rating: 5,
    preview: '냄새 제거와 전반적인 청소 모두 완벽했습니다. 가격 대비 너무 만족스럽네요.',
    author: '이00',
    count: 5,
  },
];

export function ReviewSection() {
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
          {REVIEWS.map((review) => (
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
                {review.preview}
              </p>
              <p className="text-xs text-text-muted m-0 mt-auto">
                {review.author} · {review.count}회이용
              </p>
            </Link>
          ))}
        </div>

        <div className="border border-border-base rounded-lg p-4 text-center text-[15px] text-gray-600">
          전체 평균 &nbsp;•&nbsp;{' '}
          <strong className="text-lg text-text-heading">4.8</strong>
          &nbsp; (30건)
        </div>
      </div>
    </section>
  );
}
