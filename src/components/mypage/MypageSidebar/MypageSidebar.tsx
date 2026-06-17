import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { useMyProfile } from '@/features/accounts/mypage';
import { WithdrawModal } from '@/components/mypage/WithdrawModal';
import { ROLE_LABEL, getInitial } from '@/utils/user';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.MYPAGE, label: '내 정보' },
  { to: ROUTES.MYPAGE_CHANGE_PASSWORD, label: '비밀번호 변경' },
];

const ROLE_BADGE_STYLE: Record<string, string> = {
  USER: 'bg-primary-100 text-primary-700',
  OWNER: 'bg-warning-bg text-warning',
  ADMIN: 'bg-success-bg text-success',
};

function ProfileCardSkeleton() {
  return (
    <section className="border border-border-base rounded-xl p-5 bg-bg-base flex flex-col items-center gap-3 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-bg-muted" />
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="h-4 w-24 bg-bg-muted rounded" />
        <div className="h-3 w-32 bg-bg-muted rounded" />
      </div>
    </section>
  );
}

export function MypageSidebar() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();
  const logout = useAuthStore((s) => s.logout);

  const [isWithdrawOpen, setWithdrawOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate(ROUTES.HOME);
  }

  return (
    <aside className="w-[--width-sidebar] shrink-0 flex flex-col gap-6">
      {isLoading || !profile ? (
        <ProfileCardSkeleton />
      ) : (
        <section className="border border-border-base rounded-xl p-5 bg-bg-base flex flex-col items-center gap-3">
          <div
            aria-hidden="true"
            className="w-16 h-16 rounded-full bg-primary text-text-inverse flex items-center justify-center text-2xl font-bold"
          >
            {getInitial(profile.nickname)}
          </div>
          <div className="flex flex-col items-center gap-1 min-w-0 w-full">
            <span className="text-base font-semibold text-text-heading truncate max-w-full">
              {profile.nickname}
            </span>
            <span className="text-xs text-text-muted truncate max-w-full">
              {profile.email}
            </span>
            <span
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                ROLE_BADGE_STYLE[profile.role] ?? ROLE_BADGE_STYLE.USER
              }`}
            >
              {ROLE_LABEL[profile.role] ?? '회원'}
            </span>
          </div>
        </section>
      )}

      <nav className="border border-border-base rounded-xl bg-bg-base overflow-hidden">
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                end
                to={item.to}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm no-underline border-b border-border-base last:border-b-0 transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary font-semibold'
                      : 'text-text-body hover:bg-bg-muted'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLogout}
          className="h-10 rounded-md border border-border-base text-sm text-text-body bg-bg-base hover:bg-bg-muted transition-colors"
        >
          로그아웃
        </button>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="h-10 rounded-md text-sm text-text-muted hover:text-error bg-transparent transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {isWithdrawOpen && (
        <WithdrawModal
          onClose={() => setWithdrawOpen(false)}
          onCompleted={() => {
            logout();
            navigate(ROUTES.HOME);
          }}
        />
      )}
    </aside>
  );
}
