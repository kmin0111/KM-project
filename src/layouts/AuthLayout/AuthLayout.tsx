import { Outlet } from 'react-router-dom';
import { Header } from '@/components';

export function AuthLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
