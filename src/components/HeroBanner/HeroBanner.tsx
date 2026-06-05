import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function HeroBanner() {
  return (
    <section className="bg-bg-muted py-20 px-6">
      <div className="max-w-container mx-auto text-center">
        <p className="text-sm font-semibold text-primary mb-3 tracking-[0.05em]">
          믿을 수 있는 청소 서비스
        </p>
        <h1 className="text-5xl font-extrabold text-text-heading m-0 mb-4">
          깨끗한 공간, 쾌적한 일상
        </h1>
        <p className="text-base text-text-body mb-8">
          정기청소부터 입주청소, 특수청소까지 전문 클리너가 함께합니다.
        </p>
        <Link
          to={ROUTES.ABOUT}
          className="inline-block bg-primary text-text-inverse no-underline px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary-700 transition-colors"
        >
          서비스 알아보기
        </Link>
      </div>
    </section>
  );
}
