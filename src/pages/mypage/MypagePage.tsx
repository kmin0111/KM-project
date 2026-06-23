import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MypageLayout, Stars } from '@/components';
import { useMyProfile } from '@/features/accounts/mypage';
import { useReviewList } from '@/features/reviews/list';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABEL, getInitial } from '@/utils/user';

const MY_REVIEW_PREVIEW_SIZE = 5;

function ProfileSkeleton() {
  return (
    <section className="border border-border-base rounded-xl p-6 bg-bg-base animate-pulse flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-bg-muted" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 w-32 bg-bg-muted rounded" />
          <div className="h-4 w-48 bg-bg-muted rounded" />
          <div className="h-4 w-20 bg-bg-muted rounded" />
        </div>
      </div>
      <div className="h-px bg-border-base" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-4 w-full bg-bg-muted rounded" />
        <div className="h-4 w-full bg-bg-muted rounded" />
      </div>
    </section>
  );
}

function ReviewListSkeleton() {
  return (
    <ul className="flex flex-col gap-3 list-none p-0 m-0">
      {Array.from({ length: 3 }, (_, i) => (
        <li
          key={i}
          className="border border-border-base rounded-lg p-4 flex flex-col gap-2 animate-pulse"
        >
          <div className="h-4 w-20 bg-bg-muted rounded" />
          <div className="h-4 w-24 bg-bg-muted rounded" />
          <div className="h-4 w-full bg-bg-muted rounded" />
          <div className="h-3 w-32 bg-bg-muted rounded" />
        </li>
      ))}
    </ul>
  );
}

export function MypagePage() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const {
    data: reviewData,
    isLoading: isReviewLoading,
  } = useReviewList({
    page: 1,
    size: MY_REVIEW_PREVIEW_SIZE,
    sort: 'latest',
    authorId: userId,
  });

  const reviews = reviewData?.content ?? [];

  return (
    <MypageLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-heading m-0">내 정보</h1>
        <button
          type="button"
          onClick={() => navigate(ROUTES.MYPAGE_EDIT)}
          disabled={!profile}
          className="bg-primary text-text-inverse rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          정보 수정
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <ProfileSkeleton />
        ) : isError || !profile ? (
          <section className="border border-border-base rounded-xl p-10 text-center">
            <p className="text-text-muted mb-4">내 정보를 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-4 py-2 text-sm transition-colors"
            >
              다시 시도
            </button>
          </section>
        ) : (
          <section className="border border-border-base rounded-xl p-6 bg-bg-base flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <div
                aria-hidden="true"
                className="w-20 h-20 rounded-full bg-primary text-text-inverse flex items-center justify-center text-3xl font-bold shrink-0"
              >
                {getInitial(profile.nickname)}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xl font-bold text-text-heading">
                  {profile.nickname}
                </span>
                <span className="text-sm text-text-body truncate">{profile.email}</span>
                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </span>
              </div>
            </div>

            <div className="border-t border-border-base pt-5 grid grid-cols-2 gap-4">
              <Info label="이메일" value={profile.email} />
              <Info label="닉네임" value={profile.nickname} />
              <Info label="회원 등급" value={ROLE_LABEL[profile.role] ?? profile.role} />
              <Info label="가입일" value={profile.createdAt} />
            </div>
          </section>
        )}

        <section className="border border-border-base rounded-xl p-6 bg-bg-base flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-heading m-0">나의 후기</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.REVIEWS_WRITE)}
                className="border border-border-base text-text-body hover:bg-bg-muted rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                후기 작성하기
              </button>
            </div>
          </div>

          {isReviewLoading ? (
            <ReviewListSkeleton />
          ) : reviews.length === 0 ? (
            <p className="text-sm text-text-muted m-0">
              작성하신 후기를 한눈에 확인할 수 있어요. 새로운 청소 경험을 공유해보세요!
            </p>
          ) : (
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Link
                    to={`${ROUTES.REVIEWS}/${review.id}`}
                    className="border border-border-base rounded-lg p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow no-underline bg-bg-base"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-primary">
                        [{review.type}]
                      </span>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="text-sm text-text-body leading-relaxed m-0 line-clamp-2">
                      {review.content}
                    </p>
                    <span className="text-xs text-text-muted">{review.createdAt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </MypageLayout>
  );
}

interface InfoProps {
  label: string;
  value: string;
}

function Info({ label, value }: InfoProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm text-text-heading break-all">{value}</span>
    </div>
  );
}
