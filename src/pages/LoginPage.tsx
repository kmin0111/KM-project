import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useLogin } from '@/features/accounts/login';
import { useAuthStore } from '@/stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { mutate: loginMutation, isPending } = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    loginMutation(
      { email, password },
      {
        onSuccess: (data) => {
          login(data.accessToken, data.refreshToken, data.user);
          navigate(ROUTES.HOME);
        },
        onError: () => {
          setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
        },
      },
    );
  }

  return (
    <section className="bg-bg-muted min-h-[calc(100vh-60px)] py-16 px-6">
      <div className="max-w-[420px] mx-auto bg-bg-base rounded-xl border border-border-base p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-text-heading text-center m-0 mb-8">로그인</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-semibold text-text-heading mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
              className="w-full h-11 px-4 rounded-md border border-border-base bg-bg-base text-sm text-text-heading placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-text-heading mb-2"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-md border border-border-base bg-bg-base text-sm text-text-heading placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="min-h-[20px] mb-4" role="alert" aria-live="assertive">
            {errorMessage && <p className="text-sm text-error m-0">{errorMessage}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="w-full h-11 rounded-md bg-primary text-text-inverse text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            type="button"
            disabled
            className="h-11 rounded-md bg-kakao text-kakao-text text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            카카오
          </button>
          <button
            type="button"
            disabled
            className="h-11 rounded-md bg-naver text-naver-text text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            네이버
          </button>
          <button
            type="button"
            disabled
            className="h-11 rounded-md bg-bg-base border border-border-base text-text-heading text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            구글
          </button>
        </div>

        <hr className="my-6 border-0 border-t border-border-base" />

        <div className="flex flex-col items-center gap-3 text-sm">
          <span className="text-text-muted">아직 계정이 없으신가요?</span>
          <Link
            to={ROUTES.SIGNUP}
            className="w-full h-11 flex items-center justify-center rounded-md border border-border-base text-text-body no-underline hover:bg-bg-muted transition-colors"
          >
            회원가입 하러가기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
