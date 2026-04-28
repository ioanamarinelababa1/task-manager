export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  category?: string;
}

// The backend sets access_token as an httpOnly cookie (preferred path, XSS-safe).
// It also returns the token in the body so that clients where cross-domain cookies
// are blocked (iOS Safari ITP) can fall back to Authorization: Bearer header auth.
export interface AuthResponse {
  user: { id: number; email: string };
  access_token: string;
}
