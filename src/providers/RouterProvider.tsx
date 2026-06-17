import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainPage } from '@/pages/MainPage';
import { AboutPage } from '@/pages/AboutPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/signup';
import { ReviewListPage, ReviewDetailPage, ReviewWritePage } from '@/pages/reviews';
import { MypagePage, MypageEditPage, ChangePasswordPage } from '@/pages/mypage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

/**
 * 인증이 필요한 라우트를 감싸는 가드.
 * 비로그인 상태면 로그인 페이지로 리다이렉트하며, 돌아올 경로를 state에 저장한다.
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const location = useLocation();
  if (!isLoggedIn) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path={ROUTES.HOME} element={<MainPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.REVIEWS} element={<ReviewListPage />} />
          <Route
            path={ROUTES.REVIEWS_WRITE}
            element={
              <RequireAuth>
                <ReviewWritePage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.REVIEWS_EDIT}
            element={
              <RequireAuth>
                <ReviewWritePage />
              </RequireAuth>
            }
          />
          <Route path={ROUTES.REVIEWS_DETAIL} element={<ReviewDetailPage />} />
          <Route
            path={ROUTES.MYPAGE}
            element={
              <RequireAuth>
                <MypagePage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.MYPAGE_EDIT}
            element={
              <RequireAuth>
                <MypageEditPage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.MYPAGE_CHANGE_PASSWORD}
            element={
              <RequireAuth>
                <ChangePasswordPage />
              </RequireAuth>
            }
          />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.SIGNUP_GENERAL} replace />} />
          <Route path={ROUTES.SIGNUP_GENERAL} element={<SignupPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
