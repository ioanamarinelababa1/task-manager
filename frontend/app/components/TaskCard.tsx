import { Task, TaskPriority } from '../lib/types';
import StatusBadge from './StatusBadge';

interface TaskCardProps {
  task: Task;
  index?: number;
  visible?: boolean;
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

export default function TaskCard({ task, index = 0, visible = true, onEdit, onDelete }: TaskCardProps) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'DONE';

  return (
    <div
      className={`flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100
        hover:-translate-y-0.5 hover:shadow-lg
        active:scale-95
        transition-all duration-200
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
      style={{ transitionDelay: visible ? `${index * 50}ms` : '0ms' }}
    >
      {/* Badges row: status + priority + category */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority ?? 'MEDIUM'} />
        {task.category && (
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
            {task.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description ? (
        <p className="flex-1 text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {task.description}
        </p>
      ) : (
        <p className="flex-1 text-sm text-gray-300 italic mb-4">No description</p>
      )}

      {/* Footer: date left, action buttons right — always visible */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs text-gray-400 truncate">Created {formatDate(task.createdAt)}</span>
          {task.dueDate && (
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="flex items-center justify-center rounded-xl p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600 active:bg-violet-100 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Edit task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="flex items-center justify-center rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Delete task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
