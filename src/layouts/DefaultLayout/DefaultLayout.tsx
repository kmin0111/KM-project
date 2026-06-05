import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@/components';

export function DefaultLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
