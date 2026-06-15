import { loginHandlers } from '@/features/accounts/login';
import { signupHandlers } from '@/features/accounts/signup';
import { reviewListHandlers } from '@/features/reviews/list';
import { reviewDetailHandlers } from '@/features/reviews/detail';

export const handlers = [
  ...loginHandlers,
  ...signupHandlers,
  ...reviewListHandlers,
  ...reviewDetailHandlers,
];
