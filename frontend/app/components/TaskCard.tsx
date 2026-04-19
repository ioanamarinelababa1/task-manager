import { Task, TaskPriority } from '../lib/types';
import StatusBadge from './StatusBadge';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PRIORITY_STYLES: Record<TaskPriority, { dot: string; label: string; badge: string }> = {
  LOW:    { dot: 'bg-gray-400',   label: 'Low',    badge: 'bg-gray-100 text-gray-600' },
  MEDIUM: { dot: 'bg-yellow-400', label: 'Medium', badge: 'bg-yellow-50 text-yellow-700' },
  HIGH:   { dot: 'bg-red-500',    label: 'High',   badge: 'bg-red-50 text-red-700' },
};

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'DONE';

  return (
    <div className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-gray-200 transition-all duration-200">
      {/* Top row: status + priority badges + action buttons */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority ?? 'MEDIUM'} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            aria-label="Edit task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description ? (
        <p className="flex-1 text-sm text-gray-500 leading-relaxed line-clamp-3 mb-3">
          {task.description}
        </p>
      ) : (
        <p className="flex-1 text-sm text-gray-300 italic mb-3">No description</p>
      )}

      {/* Category tag */}
      {task.category && (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {task.category}
          </span>
        </div>
      )}

      {/* Footer: created date + due date */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Created {formatDate(task.createdAt)}</span>
        {task.dueDate && (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            Due {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
