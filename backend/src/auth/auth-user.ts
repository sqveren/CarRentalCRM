export type UserRole = 'admin' | 'manager' | 'operator';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  role: UserRole;
}

export interface RequestWithUser {
  user: AuthUser;
}
