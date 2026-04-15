import AuthGuard from './components/AuthGuard';
import TasksPage from './components/TasksPage';

export default function Home() {
  return (
    <AuthGuard>
      <TasksPage />
    </AuthGuard>
  );
}
