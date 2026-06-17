import { loginHandlers } from '@/features/accounts/login';
import { signupHandlers } from '@/features/accounts/signup';
import { reviewListHandlers } from '@/features/reviews/list';
import { reviewDetailHandlers } from '@/features/reviews/detail';
import { reviewCreateHandlers } from '@/features/reviews/create';

export const handlers = [
  ...loginHandlers,
  ...signupHandlers,
  ...reviewListHandlers,
  ...reviewDetailHandlers,
  ...reviewCreateHandlers,
];
