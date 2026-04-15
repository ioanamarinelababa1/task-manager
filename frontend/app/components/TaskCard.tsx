import { Task } from '../lib/types';
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

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-gray-200 transition-all duration-200">
      {/* Top row: badge + actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <StatusBadge status={task.status} />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <p className="flex-1 text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
          {task.description}
        </p>
      ) : (
        <p className="flex-1 text-sm text-gray-300 italic mb-4">No description</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">Created {formatDate(task.createdAt)}</span>
        {task.updatedAt !== task.createdAt && (
          <span className="text-xs text-gray-400">Updated {formatDate(task.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}
