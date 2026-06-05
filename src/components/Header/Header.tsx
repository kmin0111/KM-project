import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function Header() {
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
        </nav>
      </div>
    </header>
  );
}
