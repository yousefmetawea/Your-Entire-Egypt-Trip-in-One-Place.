import type { IsoDateTime } from './common';

export type UserId = string;

export type UserRole = 'traveler' | 'admin';

export interface User {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
  createdAt: IsoDateTime;
}
