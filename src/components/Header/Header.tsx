import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    navigate(ROUTES.HOME);
  }

  return (
    <header className="border-b border-border-base bg-bg-base">
      <div className="max-w-container mx-auto px-6 h-[60px] flex items-center justify-between">
        <Link to={ROUTES.HOME} className="text-xl font-bold text-text-heading no-underline">
          클린하우스
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to={ROUTES.ABOUT}
            className="text-sm text-gray-600 no-underline hover:text-text-heading transition-colors"
          >
            서비스소개
          </Link>
          <Link
            to={ROUTES.REVIEWS}
            className="text-sm text-gray-600 no-underline hover:text-text-heading transition-colors"
          >
            고객후기
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to={ROUTES.MYPAGE}
                className="text-sm text-gray-600 no-underline hover:text-text-heading transition-colors"
              >
                마이페이지
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-primary text-text-inverse px-[18px] py-2 rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-none"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-gray-600 no-underline hover:text-text-heading transition-colors"
              >
                로그인
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className="bg-primary text-text-inverse no-underline px-[18px] py-2 rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
