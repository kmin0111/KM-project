import { loginHandlers } from '@/features/accounts/login';
import { signupHandlers } from '@/features/accounts/signup';

export const handlers = [...loginHandlers, ...signupHandlers];
