import { TaskStatus } from '../lib/types';

const config: Record<TaskStatus, { label: string; classes: string }> = {
  TODO: {
    label: 'To Do',
    classes: 'bg-gray-100 text-gray-600 ring-gray-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  DONE: {
    label: 'Done',
    classes: 'bg-green-50 text-green-700 ring-green-200',
  },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, classes } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'TODO'
            ? 'bg-gray-400'
            : status === 'IN_PROGRESS'
            ? 'bg-blue-500'
            : 'bg-green-500'
        }`}
      />
      {label}
    </span>
  );
}
