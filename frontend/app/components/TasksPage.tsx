'use client';

import { useCallback, useEffect, useState } from 'react';
import { Task, TaskFormData } from '../lib/types';
import { createTask, deleteTask, fetchTasks, updateTask } from '../lib/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import DeleteModal from './DeleteModal';
import StatusBadge from './StatusBadge';

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; task: Task }
  | { type: 'delete'; task: Task };

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-20 rounded-full bg-gray-100" />
      </div>
      <div className="h-4 w-3/4 rounded bg-gray-100 mb-2" />
      <div className="h-3 w-full rounded bg-gray-100 mb-1" />
      <div className="h-3 w-2/3 rounded bg-gray-100 mb-4" />
      <div className="h-px w-full bg-gray-50 mb-3" />
      <div className="h-3 w-1/3 rounded bg-gray-100" />
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [toast, setToast] = useState('');

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const loadTasks = useCallback(async () => {
    setError('');
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    const updated = await updateTask(modal.task.id, data);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Task updated successfully!');
  }

  async function handleDelete() {
    if (modal.type !== 'delete') return;
    await deleteTask(modal.task.id);
    setTasks((prev) => prev.filter((t) => t.id !== modal.task.id));
    showToast('Task deleted.');
  }

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Notebook spine */}
                  <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#c4b5fd"/>
                  {/* Notebook cover */}
                  <rect x="6" y="3" width="14" height="18" rx="1.5" fill="white" opacity="0.95"/>
                  {/* Spiral rings */}
                  <circle cx="6" cy="7.5"  r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
                  <circle cx="6" cy="12"   r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
                  <circle cx="6" cy="16.5" r="1.2" fill="none" stroke="#7c3aed" strokeWidth="1.2"/>
                  {/* Text lines */}
                  <rect x="9.5" y="7"  width="7"   height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                  <rect x="9.5" y="10" width="8.5" height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                  <rect x="9.5" y="13" width="6.5" height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                  <rect x="9.5" y="16" width="8"   height="1.2" rx="0.6" fill="#7c3aed" opacity="0.5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Task Manager</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Manage your tasks</p>
              </div>
            </div>
            <button
              onClick={() => setModal({ type: 'create' })}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {!loading && !error && tasks.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-gray-100">
              <span className="text-sm font-semibold text-gray-900">{tasks.length}</span>
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
              className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
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

        {/* Empty state */}
        {!loading && !error && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
              <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No tasks yet</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Get started by creating your first task. Stay organised and productive.
            </p>
            <button
              onClick={() => setModal({ type: 'create' })}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create your first task
            </button>
          </div>
        )}

        {/* Task grid */}
        {!loading && !error && tasks.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setModal({ type: 'edit', task: t })}
                onDelete={(t) => setModal({ type: 'delete', task: t })}
              />
            ))}
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

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
