import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ROUTES } from '@/constants/routes';
import { useSignup, type UserRole, type SignupErrorResponse } from '@/features/accounts/signup';
import { Button, Input, PasswordInput } from '@/components';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  role: UserRole;
  companyName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
}

function validate(fields: FormState): string | null {
  if (fields.role === 'OWNER' && !fields.companyName.trim()) return '업체명을 입력해주세요.';
  if (!fields.email.trim()) return '이메일을 입력해주세요.';
  if (!EMAIL_REGEX.test(fields.email)) return '올바른 이메일 형식을 입력해주세요.';
  if (!fields.password) return '비밀번호를 입력해주세요.';
  if (fields.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  if (fields.password !== fields.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
  if (!fields.nickname.trim()) return '닉네임을 입력해주세요.';
  return null;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    role: 'CUSTOMER',
    companyName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const { mutate: signup, isPending } = useSignup();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleRoleChange(newRole: UserRole) {
    setForm((prev) => ({ ...prev, role: newRole, companyName: '' }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    const validationError = validate(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    signup(
      {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        role: form.role,
        ...(form.role === 'OWNER' && { companyName: form.companyName }),
      },
      {
        onSuccess: () => {
          navigate(ROUTES.LOGIN);
        },
        onError: (error) => {
          if (isAxiosError<SignupErrorResponse>(error)) {
            setErrorMessage(error.response?.data?.message ?? '회원가입 중 오류가 발생했습니다.');
            return;
          }
          setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        },
      },
    );
  }

  const roleButtonClass = (selected: boolean) =>
    `flex-1 h-11 rounded-md text-sm font-semibold transition-colors ${
      selected
        ? 'bg-primary text-text-inverse'
        : 'bg-bg-base border border-border-base text-text-body hover:bg-bg-muted'
    }`;

  return (
    <section className="bg-bg-muted min-h-[calc(100vh-60px)] py-16 px-6">
      <div className="max-w-[420px] mx-auto bg-bg-base rounded-xl border border-border-base p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-text-heading text-center m-0 mb-8">회원가입</h1>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="border-0 p-0 m-0 mb-5">
            <legend className="block text-sm font-semibold text-text-heading mb-2 w-full">
              가입 유형 <span className="text-error">*</span>
            </legend>
            <div role="radiogroup" className="flex gap-2">
              <button
                type="button"
                role="radio"
                aria-checked={form.role === 'CUSTOMER'}
                onClick={() => handleRoleChange('CUSTOMER')}
                className={roleButtonClass(form.role === 'CUSTOMER')}
              >
                고객
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={form.role === 'OWNER'}
                onClick={() => handleRoleChange('OWNER')}
                className={roleButtonClass(form.role === 'OWNER')}
              >
                업체
              </button>
            </div>
          </fieldset>

          {form.role === 'OWNER' && (
            <div className="mb-5">
              <Input
                id="companyName"
                label="업체명"
                required
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                placeholder="예: ○○클리닝"
              />
            </div>
          )}

          <div className="mb-5">
            <Input
              id="email"
              type="email"
              label="이메일"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className="mb-5">
            <PasswordInput
              id="password"
              label="비밀번호"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="mb-5">
            <PasswordInput
              id="passwordConfirm"
              label="비밀번호 확인"
              required
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="mb-3">
            <Input
              id="nickname"
              label="닉네임"
              required
              autoComplete="nickname"
              value={form.nickname}
              onChange={(e) => update('nickname', e.target.value)}
              placeholder="홍길동"
            />
          </div>

          <div className="min-h-[1.25rem] mb-4" aria-live="polite">
            {errorMessage && (
              <p className="text-sm text-error m-0">
                <span aria-hidden="true">⚠ </span>
                {errorMessage}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending} aria-busy={isPending} className="w-full">
            {isPending ? '가입 중...' : '가입하기'}
          </Button>
        </form>

        <hr className="my-6 border-0 border-t border-border-base" />

        <div className="flex flex-col items-center gap-3 text-sm">
          <span className="text-text-muted">이미 계정이 있으신가요?</span>
          <Link
            to={ROUTES.LOGIN}
            className="w-full h-11 flex items-center justify-center rounded-md border border-border-base text-text-body no-underline hover:bg-bg-muted transition-colors"
          >
            로그인하러 가기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
