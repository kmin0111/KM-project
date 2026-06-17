import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MypageLayout, PasswordInput } from '@/components';
import { useChangePassword } from '@/features/accounts/mypage';
import { useAuthStore } from '@/stores/authStore';
import { extractErrorMessage } from '@/utils/error';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage('현재 비밀번호와 다른 비밀번호를 입력해주세요.');
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (error) => {
          setErrorMessage(
            extractErrorMessage(
              error,
              '비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
            ),
          );
        },
      },
    );
  }

  function handleGoToLogin() {
    // 보안을 위해 비밀번호 변경 직후에는 세션을 종료시키고 다시 로그인하도록 유도한다.
    logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <MypageLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-text-heading m-0">비밀번호 변경</h1>

        {isSuccess ? (
          <section
            role="status"
            aria-live="polite"
            className="border border-success rounded-xl p-8 bg-success-bg text-center flex flex-col gap-3"
          >
            <h2 className="text-lg font-bold text-text-heading m-0">
              비밀번호가 변경되었습니다.
            </h2>
            <p className="text-sm text-text-body m-0">
              보안을 위해 다시 로그인해 주세요.
            </p>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="self-center mt-2 h-10 px-5 rounded-md bg-primary text-text-inverse text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              로그인하러 가기
            </button>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="border border-border-base rounded-xl p-6 bg-bg-base flex flex-col gap-5"
          >
            <div>
              <PasswordInput
                id="currentPassword"
                label="현재 비밀번호"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="현재 비밀번호"
                autoComplete="current-password"
              />
            </div>

            <div>
              <PasswordInput
                id="newPassword"
                label="새 비밀번호"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="8자 이상"
                autoComplete="new-password"
              />
              <p className="mt-2 text-xs text-text-muted">8자 이상으로 입력해주세요.</p>
            </div>

            <div>
              <PasswordInput
                id="confirmPassword"
                label="새 비밀번호 확인"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="새 비밀번호 다시 입력"
                autoComplete="new-password"
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
                disabled={changePassword.isPending}
                aria-busy={changePassword.isPending}
                className="h-11 px-5 rounded-md bg-primary text-text-inverse text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {changePassword.isPending ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </form>
        )}
      </div>
    </MypageLayout>
  );
}
