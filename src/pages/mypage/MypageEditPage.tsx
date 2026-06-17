import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Input, MypageLayout } from '@/components';
import { useMyProfile, useUpdateProfile } from '@/features/accounts/mypage';
import { extractErrorMessage } from '@/utils/error';

export function MypageEditPage() {
  const navigate = useNavigate();

  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 프로필이 처음 로드될 때 한 번만 폼에 hydrate 한다.
  // (nickname을 의도적으로 비웠을 때 재초기화 되지 않도록 ref 가드를 둔다.)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (profile && !hydratedRef.current) {
      hydratedRef.current = true;
      setNickname(profile.nickname);
    }
  }, [profile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    const trimmed = nickname.trim();
    if (!trimmed) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 20) {
      setErrorMessage('닉네임은 2~20자로 입력해주세요.');
      return;
    }

    updateProfile.mutate(
      { nickname: trimmed },
      {
        onSuccess: () => {
          // authStore 업데이트는 useUpdateProfile onSuccess에서 일괄 처리됨
          navigate(ROUTES.MYPAGE);
        },
        onError: (error) => {
          setErrorMessage(
            extractErrorMessage(
              error,
              '닉네임을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
            ),
          );
        },
      },
    );
  }

  return (
    <MypageLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-text-heading m-0">정보 수정</h1>

        {isLoading ? (
          <section className="border border-border-base rounded-xl p-6 bg-bg-base animate-pulse flex flex-col gap-4">
            <div className="h-5 w-32 bg-bg-muted rounded" />
            <div className="h-11 w-full bg-bg-muted rounded" />
            <div className="h-5 w-32 bg-bg-muted rounded" />
            <div className="h-11 w-full bg-bg-muted rounded" />
          </section>
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
          <form
            onSubmit={handleSubmit}
            noValidate
            className="border border-border-base rounded-xl p-6 bg-bg-base flex flex-col gap-5"
          >
            <div>
              <Input
                id="email"
                label="이메일"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className="bg-bg-muted cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-text-muted">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            <div>
              <Input
                id="nickname"
                label="닉네임"
                required
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="2~20자로 입력해주세요"
                maxLength={20}
                autoComplete="off"
              />
            </div>

            <div className="min-h-[20px]" role="alert" aria-live="assertive">
              {errorMessage && <p className="text-sm text-error m-0">{errorMessage}</p>}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate(ROUTES.MYPAGE)}
                className="h-11 px-5 rounded-md border border-border-base text-sm font-semibold text-text-body bg-bg-base hover:bg-bg-muted transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={updateProfile.isPending}
                aria-busy={updateProfile.isPending}
                className="h-11 px-5 rounded-md bg-primary text-text-inverse text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateProfile.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        )}
      </div>
    </MypageLayout>
  );
}
