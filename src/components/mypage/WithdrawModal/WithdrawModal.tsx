import { useEffect, useState, type FormEvent } from 'react';
import { PasswordInput } from '@/components';
import { useWithdraw } from '@/features/accounts/mypage';
import { extractErrorMessage } from '@/utils/error';

interface WithdrawModalProps {
  onClose: () => void;
  onCompleted: () => void;
}

/**
 * 회원 탈퇴 확인 모달.
 *
 * 접근성:
 * - ESC 키로 닫기
 * - body scroll lock (오버레이 표시 중 배경 스크롤 방지)
 * - 모달 진입 시 첫 입력 필드에 자동 포커스
 */
export function WithdrawModal({ onClose, onCompleted }: WithdrawModalProps) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const withdraw = useWithdraw();

  // ESC 키 닫기
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onClose]);

  // body scroll lock
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    if (!password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }
    withdraw.mutate(
      { password },
      {
        onSuccess: () => {
          onCompleted();
        },
        onError: (error) => {
          setErrorMessage(
            extractErrorMessage(error, '비밀번호가 일치하지 않습니다.'),
          );
        },
      },
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-bg-base rounded-xl border border-border-base p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="withdraw-modal-title"
          className="text-lg font-bold text-text-heading m-0 mb-2"
        >
          정말 탈퇴하시겠어요?
        </h2>
        <p className="text-sm text-text-body mb-5 leading-relaxed">
          탈퇴 시 작성한 후기와 계정 정보가 모두 사라지며, 복구할 수 없습니다.
          계속하시려면 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <PasswordInput
              id="withdraw-password"
              label="비밀번호"
              required
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
            />
          </div>

          <div className="min-h-[20px] mb-4" role="alert" aria-live="assertive">
            {errorMessage && (
              <p className="text-sm text-error m-0">{errorMessage}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-md border border-border-base text-sm font-semibold text-text-body bg-bg-base hover:bg-bg-muted transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={withdraw.isPending}
              aria-busy={withdraw.isPending}
              className="flex-1 h-11 rounded-md bg-error text-text-inverse text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {withdraw.isPending ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
