import type { ReactNode } from 'react';
import { MypageSidebar } from '@/components';

interface MypageLayoutProps {
  children: ReactNode;
}

/**
 * 마이페이지 공통 레이아웃.
 * 좌측 사이드바 + 우측 메인 컨텐츠 2-column 구조.
 */
export function MypageLayout({ children }: MypageLayoutProps) {
  return (
    <div className="max-w-container mx-auto px-6 py-10">
      <div className="flex gap-8 items-start">
        <MypageSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
