import { loginHandlers } from '@/features/accounts/login';
import { signupHandlers } from '@/features/accounts/signup';
import { reviewListHandlers } from '@/features/reviews/list';

export const handlers = [...loginHandlers, ...signupHandlers, ...reviewListHandlers];
