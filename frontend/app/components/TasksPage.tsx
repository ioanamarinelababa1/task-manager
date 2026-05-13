'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskFormData, TaskStatus, PaginationMeta } from '../lib/types';
import { createTask, deleteTask, getTasks, logoutUser, updateTask } from '../lib/api';
import { clearUser, getUser } from '../lib/auth';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import DeleteModal from './DeleteModal';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; task: Task }
  | { type: 'delete'; task: Task };

interface ToastState {
  message: string;
  id: number;
}

// Self-contained toast component — mounted per-message via key so animation always replays
function Toast({ message, onHide }: { message: string; onHide: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    const dismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(onHide, 300);
    }, 3000);
    return () => clearTimeout(dismiss);
  }, [onHide]);

  return (
    <div
      className={`fixed z-50 flex items-center gap-3 overflow-hidden rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl
        transition-all duration-300
        bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-auto sm:top-6 sm:w-auto sm:max-w-sm
        ${visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 sm:translate-y-0 sm:-translate-y-4'
        }
      `}
    >
      <svg className="h-4 w-4 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <span className="flex-1">{message}</span>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/10">
        {visible && (
          <div
            className="h-full bg-green-400/60 rounded-full"
            style={{ animation: 'shrink 3s linear forwards' }}
          />
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-5 w-14 rounded-full bg-gray-100" />
      </div>
      <div className="h-5 w-3/4 rounded-lg bg-gray-100 mb-2" />
      <div className="h-3 w-full rounded bg-gray-100 mb-1.5" />
      <div className="h-3 w-2/3 rounded bg-gray-100 mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-3 w-1/3 rounded bg-gray-100" />
        <div className="flex gap-1">
          <div className="h-9 w-9 rounded-xl bg-gray-100" />
          <div className="h-9 w-9 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const router = useRouter();
  const user = getUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const onHideRef = useRef<() => void>(() => setToastState(null));

  useEffect(() => {
    onHideRef.current = () => setToastState(null);
  });

  // Sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stagger animation: trigger after tasks load, filter or page changes
  useEffect(() => {
    if (!loading) {
      setCardsVisible(false);
      const t = setTimeout(() => setCardsVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading, filterStatus, currentPage]);

  const showToast = useCallback((message: string) => {
    setToastState({ message, id: Date.now() });
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks({
        page: currentPage,
        limit: 10,
        ...(filterStatus ? { status: filterStatus } : {}),
      });
      setTasks(data.data);
      setPaginationMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(data: TaskFormData) {
    const newTask = await createTask(data);
    setTasks((prev) => [newTask, ...prev]);
    showToast('Task created successfully!');
  }

  async function handleUpdate(data: TaskFormData) {
    if (modal.type !== 'edit') return;
    const taskId = modal.task.id;
    console.log('[handleUpdate] task=%o body=%o', modal.task, data);
    if (!taskId || typeof taskId !== 'number' || taskId <= 0) {
      console.error('[handleUpdate] Invalid task id:', taskId);
      return;
    }
    const updated = await updateTask(taskId, data);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Task updated successfully!');
  }

  async function handleDelete() {
    if (modal.type !== 'delete') return;
    await deleteTask(modal.task.id);
    setTasks((prev) => prev.filter((t) => t.id !== modal.task.id));
    showToast('Task deleted.');
  }

  async function handleLogout() {
    await logoutUser().catch(() => {});
    clearUser();
    router.replace('/login');
  }

  function handleFilterChange(value: TaskStatus | null) {
    setFilterStatus(value);
    setCurrentPage(1);
  }

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalCount = paginationMeta?.total ?? tasks.length;

  const filterOptions: { label: string; value: TaskStatus | null; count: number; dot?: string }[] = [
    { label: 'All', value: null, count: totalCount },
    { label: 'To Do', value: 'TODO', count: todoCount, dot: 'bg-gray-400' },
    { label: 'In Progress', value: 'IN_PROGRESS', count: inProgressCount, dot: 'bg-blue-500' },
    { label: 'Done', value: 'DONE', count: doneCount, dot: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — shadow appears on scroll */}
      <header
        className={`bg-white border-b border-gray-100 sticky top-0 z-40 transition-shadow duration-200 ${
          headerScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* flex-col on mobile (title+buttons row, then search row); flex-row on desktop (all inline) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:h-16 sm:gap-4 py-3 sm:py-0 gap-2">
            {/* Row 1 on mobile / left section on desktop */}
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#c4b5fd"/>
                    <rect x="6" y="3" width="14" height="18" rx="1.5" fill="white" opacity="0.95"/>
                    <circle cx="6" cy="7.5"  r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
                    <circle cx="6" cy="12"   r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
                    <circle cx="6" cy="16.5" r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
                    <rect x="9.5" y="7"  width="7"   height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                    <rect x="9.5" y="10" width="8.5" height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                    <rect x="9.5" y="13" width="6.5" height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                    <rect x="9.5" y="16" width="8"   height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">Task Manager</h1>
                  {user && (
                    <p className="text-xs text-gray-400 hidden sm:block truncate max-w-[180px]">{user.email}</p>
                  )}
                </div>
              </div>
              {/* Buttons visible on mobile only (right side of title row) */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setModal({ type: 'create' })}
                  className="flex items-center gap-2 rounded-full bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-sm min-h-[44px]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors min-h-[44px]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* SearchBar — full width on mobile (second row), flex-1 on desktop */}
            <div className="sm:flex-1 sm:min-w-0">
              <SearchBar onSelectTask={(task) => setModal({ type: 'edit', task })} />
            </div>

            {/* Buttons visible on desktop only */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => setModal({ type: 'create' })}
                className="flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-sm min-h-[44px]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors min-h-[44px]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {!loading && !error && totalCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-gray-100">
              <span className="text-sm font-semibold text-gray-900">{totalCount}</span>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="TODO" />
              <span className="text-sm font-medium text-gray-600">{todoCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="IN_PROGRESS" />
              <span className="text-sm font-medium text-gray-600">{inProgressCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="DONE" />
              <span className="text-sm font-medium text-gray-600">{doneCount}</span>
            </div>
            <button
              onClick={loadTasks}
              className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        )}

        {/* Filter buttons — horizontally scrollable on mobile, no wrap */}
        {!loading && !error && totalCount > 0 && (
          <div className="flex flex-nowrap items-center gap-2 mb-6 overflow-x-auto scroll-smooth pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {filterOptions.map(({ label, value, count, dot }) => {
              const active = filterStatus === value;
              return (
                <button
                  key={label}
                  onClick={() => handleFilterChange(value)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[44px] ${
                    active
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dot && (
                    <span className={`h-2 w-2 rounded-full shrink-0 ${active ? 'bg-violet-300' : dot}`} />
                  )}
                  {label}
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-semibold leading-none ${
                      active ? 'bg-violet-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-100 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Failed to load tasks</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={loadTasks}
                  className="mt-3 text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state — with illustration and pulsing CTA */}
        {!loading && !error && tasks.length === 0 && !filterStatus && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-6 select-none" aria-hidden="true">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
              Get started by creating your first task. Stay organised and productive.
            </p>
            <button
              onClick={() => setModal({ type: 'create' })}
              className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-sm animate-pulse hover:animate-none min-h-[48px]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create your first task
            </button>
          </div>
        )}

        {/* Empty filter state */}
        {!loading && !error && tasks.length === 0 && filterStatus && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-400 mb-3">No tasks match this filter.</p>
            <button
              onClick={() => handleFilterChange(null)}
              className="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
            >
              Show all tasks
            </button>
          </div>
        )}

        {/* Task grid — staggered fade-in */}
        {!loading && !error && tasks.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                visible={cardsVisible}
                onEdit={(t) => setModal({ type: 'edit', task: t })}
                onDelete={(t) => setModal({ type: 'delete', task: t })}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!loading && !error && paginationMeta && paginationMeta.totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!paginationMeta.hasPreviousPage}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-200 min-h-[44px] flex items-center">
                Page {paginationMeta.page} of {paginationMeta.totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!paginationMeta.hasNextPage}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Showing {tasks.length} of {paginationMeta.total} task{paginationMeta.total !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      {modal.type === 'create' && (
        <TaskModal
          onClose={() => setModal({ type: 'none' })}
          onSubmit={handleCreate}
        />
      )}
      {modal.type === 'edit' && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ type: 'none' })}
          onSubmit={handleUpdate}
        />
      )}
      {modal.type === 'delete' && (
        <DeleteModal
          taskTitle={modal.task.title}
          onClose={() => setModal({ type: 'none' })}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast — self-contained animated component, remounted per message */}
      {toastState && (
        <Toast
          key={toastState.id}
          message={toastState.message}
          onHide={onHideRef.current}
        />
      )}
    </div>
  );
}
