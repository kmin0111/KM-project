import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Stars } from '@/components';
import { useReviewList } from '@/features/reviews/list';

interface ServiceItem {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}


const SERVICES: ServiceItem[] = [
  {
    icon: '🏠',
    title: '정기청소',
    subtitle: '주기적인 청결 유지',
    description:
      '매주 또는 격주 방문으로 항상 깨끗한 공간을 유지합니다. 청소 전문가가 꼼꼼하게 관리합니다.',
    features: ['거실·주방·욕실 청소', '청소 용품 제공', '주기 선택 가능', '동일 클리너 배정'],
  },
  {
    icon: '🏢',
    title: '입주청소',
    subtitle: '이사 전후 완벽 청소',
    description:
      '이사 전·후 내부 전체를 꼼꼼하게 청소합니다. 새 집처럼 깨끗한 환경을 제공합니다.',
    features: ['전체 공간 클리닝', '창틀·베란다 청소', '주방 후드 세척', '바닥 광택 작업'],
  },
  {
    icon: '✨',
    title: '특수청소',
    subtitle: '전문 장비로 깊은 청소',
    description:
      '에어컨, 소파, 카펫 등 특수 장비가 필요한 청소를 전문적으로 진행합니다.',
    features: ['에어컨 분해 세척', '소파·매트리스 살균', '카펫 스팀 청소', '곰팡이 제거'],
  },
];

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: '상담 신청',
    description: '원하시는 서비스를 선택하고 간단한 정보를 입력해 주세요.',
  },
  {
    step: 2,
    title: '일정 확인',
    description: '담당 매니저가 일정과 견적을 안내해 드립니다.',
  },
  {
    step: 3,
    title: '전문가 방문',
    description: '약속된 시간에 전문 클리너가 방문하여 청소를 진행합니다.',
  },
  {
    step: 4,
    title: '청소 완료',
    description: '청소 결과를 확인하시고, 후기를 남겨 주세요.',
  },
];

const STATIC_STATS = [
  { label: '전문 클리너', value: '50', unit: '+ 명' },
];

export function AboutPage() {
  const { data, isLoading } = useReviewList({ page: 1, size: 3, sort: 'latest' });

  const totalCount = data?.totalCount ?? 0;
  const averageRating = data?.averageRating ?? 0;
  const latestReviews = data?.content ?? [];

  return (
    <>
      {/* 1. 히어로 섹션 */}
      <section className="bg-bg-muted py-20 px-6">
        <div className="max-w-container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-heading m-0 mb-4 leading-tight">
            전문가의 손길로, 깨끗한 공간을 경험하세요
          </h1>
          <p className="text-base md:text-lg text-text-body mb-8">
            클린하우스는 정기청소·입주청소·특수청소 전문 서비스입니다
          </p>
          <Link
            to={ROUTES.REVIEWS}
            className="inline-block bg-primary text-text-inverse no-underline px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary-700 transition-colors"
          >
            고객 후기 보기
          </Link>
        </div>
      </section>

      {/* 2. 서비스 종류 섹션 */}
      <section className="py-20 px-6 bg-bg-base">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading m-0 mb-3">
              클린하우스 서비스
            </h2>
            <p className="text-base text-text-body m-0">
              공간과 상황에 맞춘 세 가지 전문 청소 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <article
                key={service.title}
                className="border border-border-base rounded-2xl p-8 flex flex-col gap-4 bg-bg-base hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-3xl"
                  aria-hidden="true"
                >
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-heading m-0 mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm font-semibold text-primary m-0">
                    {service.subtitle}
                  </p>
                </div>
                <p className="text-sm text-text-body leading-relaxed m-0">
                  {service.description}
                </p>
                <ul className="list-none p-0 m-0 flex flex-col gap-2 mt-auto pt-4 border-t border-border-base">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm text-text-body flex items-center gap-2"
                    >
                      <span className="text-primary font-bold" aria-hidden="true">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 이용 절차 섹션 */}
      <section className="py-20 px-6 bg-bg-subtle">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading m-0 mb-3">
              이용 절차
            </h2>
            <p className="text-base text-text-body m-0">
              간단한 4단계로 청소 서비스를 이용하실 수 있습니다
            </p>
          </div>

          <ol className="list-none p-0 m-0 grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <li
                key={step.step}
                className="bg-bg-base rounded-2xl p-6 flex flex-col gap-3 border border-border-base"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-text-inverse flex items-center justify-center font-bold text-base">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-text-heading m-0">
                  {step.title}
                </h3>
                <p className="text-sm text-text-body leading-relaxed m-0">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. 수치로 보는 클린하우스 섹션 */}
      <section className="py-20 px-6 bg-bg-base">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading m-0 mb-3">
              수치로 보는 클린하우스
            </h2>
            <p className="text-base text-text-body m-0">
              많은 고객분들이 클린하우스를 선택해 주셨습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 rounded-2xl p-8 text-center border border-primary-100">
              <p className="text-sm font-semibold text-text-body m-0 mb-3">누적 후기</p>
              <p className="m-0">
                <span className="text-4xl md:text-5xl font-extrabold text-primary">
                  {isLoading ? '-' : totalCount.toLocaleString()}
                </span>
                <span className="text-xl font-semibold text-primary-700"> 건</span>
              </p>
            </div>

            <div className="bg-primary-50 rounded-2xl p-8 text-center border border-primary-100">
              <p className="text-sm font-semibold text-text-body m-0 mb-3">고객 만족도</p>
              <p className="m-0">
                <span className="text-4xl md:text-5xl font-extrabold text-primary">
                  {isLoading ? '-' : averageRating.toFixed(1)}
                </span>
                <span className="text-xl font-semibold text-primary-700"> / 5.0</span>
              </p>
            </div>

            {STATIC_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-primary-50 rounded-2xl p-8 text-center border border-primary-100"
              >
                <p className="text-sm font-semibold text-text-body m-0 mb-3">{stat.label}</p>
                <p className="m-0">
                  <span className="text-4xl md:text-5xl font-extrabold text-primary">
                    {stat.value}
                  </span>
                  <span className="text-xl font-semibold text-primary-700">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 고객 후기 미리보기 섹션 */}
      <section className="py-20 px-6 bg-bg-subtle">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading m-0 mb-3">
              실제 고객 후기
            </h2>
            <p className="text-base text-text-body m-0">
              클린하우스를 이용하신 고객분들의 생생한 후기를 확인해 보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-bg-base border border-border-base rounded-2xl p-6 flex flex-col gap-3 animate-pulse"
                  >
                    <div className="h-5 w-16 bg-bg-muted rounded-full" />
                    <div className="h-4 w-24 bg-bg-muted rounded" />
                    <div className="h-16 w-full bg-bg-muted rounded" />
                    <div className="h-3 w-12 bg-bg-muted rounded mt-auto" />
                  </div>
                ))
              : latestReviews.map((review) => (
                  <Link
                    key={review.id}
                    to={`${ROUTES.REVIEWS}/${review.id}`}
                    className="bg-bg-base border border-border-base rounded-2xl p-6 flex flex-col gap-3 no-underline hover:shadow-md transition-shadow"
                  >
                    <span className="inline-block self-start text-xs font-semibold text-primary bg-primary-50 px-3 py-1 rounded-full">
                      {review.type}
                    </span>
                    <Stars rating={review.rating} />
                    <p className="text-sm text-text-body leading-relaxed m-0 flex-1 line-clamp-3">
                      {review.content}
                    </p>
                    <p className="text-xs text-text-muted m-0 pt-3 border-t border-border-base">
                      {review.author}
                    </p>
                  </Link>
                ))}
          </div>

          <div className="text-center">
            <Link
              to={ROUTES.REVIEWS}
              className="inline-block bg-bg-base text-primary border border-primary no-underline px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary-50 transition-colors"
            >
              전체 후기 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CTA 섹션 */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-inverse m-0 mb-8 leading-tight">
            지금 바로 클린하우스를 경험해보세요
          </h2>
          <Link
            to={ROUTES.REVIEWS}
            className="inline-block bg-text-inverse text-primary no-underline px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-bg-muted transition-colors"
          >
            서비스 신청하기
          </Link>
        </div>
      </section>
    </>
  );
}
