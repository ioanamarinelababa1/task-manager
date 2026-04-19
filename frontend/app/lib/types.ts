export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
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

// access_token is no longer returned in the body — it is set as an httpOnly cookie
// by the backend. Only non-sensitive user info is returned to the client.
export interface AuthResponse {
  user: { id: number; email: string };
}
