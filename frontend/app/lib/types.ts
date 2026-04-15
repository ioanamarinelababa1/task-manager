export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
}

// access_token is no longer returned in the body — it is set as an httpOnly cookie
// by the backend. Only non-sensitive user info is returned to the client.
export interface AuthResponse {
  user: { id: number; email: string };
}
