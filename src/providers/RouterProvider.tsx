import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DefaultLayout } from '@/layouts/DefaultLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainPage } from '@/pages/MainPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/signup';
import { ReviewListPage } from '@/pages/reviews';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from '@/constants/routes';

export function RouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path={ROUTES.HOME} element={<MainPage />} />
          <Route path={ROUTES.REVIEWS} element={<ReviewListPage />} />
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
