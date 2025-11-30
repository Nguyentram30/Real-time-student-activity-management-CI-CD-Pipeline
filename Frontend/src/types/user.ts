import type { Role } from "@/lib/db";

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role?: Role;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}