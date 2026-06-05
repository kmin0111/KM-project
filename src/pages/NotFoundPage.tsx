import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <h1 className="text-6xl font-bold text-text-heading m-0">404</h1>
      <p className="text-text-body">페이지를 찾을 수 없습니다.</p>
      <Link to={ROUTES.HOME} className="text-primary hover:underline">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
