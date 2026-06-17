import { loginHandlers } from '@/features/accounts/login';
import { signupHandlers } from '@/features/accounts/signup';
import { mypageHandlers } from '@/features/accounts/mypage';
import { reviewListHandlers } from '@/features/reviews/list';
import { reviewDetailHandlers } from '@/features/reviews/detail';
import { reviewCreateHandlers } from '@/features/reviews/create';

export const handlers = [
  ...loginHandlers,
  ...signupHandlers,
  ...mypageHandlers,
  ...reviewListHandlers,
  ...reviewDetailHandlers,
  ...reviewCreateHandlers,
];
