export type UserRole = 'CUSTOMER' | 'OWNER';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
  companyName?: string;
}

export interface SignupResponse {
  user: {
    id: number;
    email: string;
    nickname: string;
    role: UserRole;
  };
}

export interface SignupErrorResponse {
  message: string;
  code?: string;
}
