import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Play,
  Plus,
  Save,
  Timer,
  Trash2,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { VisualRewardStage } from '../components/VisualRewardStage';

type TaskFilter = 'all' | 'active' | 'completed';

export const TodoPage: React.FC = () => {
  const {
    microtasks,
    modules,
    toggleMicrotask,
    addMicrotask,
    editMicrotask,
    deleteMicrotask,
    toggleSubstep,
    addSubstepsToTask,
    editSubstep,
    deleteSubstep,
    openTaskInFocusStudio,
    startTwoMinuteWarmup,
  } = useAppState();

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newMinutes, setNewMinutes] = useState(15);
  const [newModuleId, setNewModuleId] = useState(modules[1]?.id ?? modules[0]?.id ?? 'mod-2');

  // Task inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftMinutes, setDraftMinutes] = useState(15);
  const [draftModuleId, setDraftModuleId] = useState('');

  // Substep inline add & edit state
  const [newStepByTask, setNewStepByTask] = useState<Record<string, string>>({});
  const [editingSubstepKey, setEditingSubstepKey] = useState<string | null>(null);
  const [draftSubstepText, setDraftSubstepText] = useState('');

  const filteredTasks = microtasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMicrotask(newTitle, newMinutes, newModuleId);
    setNewTitle('');
  };

  const beginEditTask = (
    id: string,
    title: string,
    minutes: number,
    moduleId: string
  ) => {
    setEditingTaskId(id);
    setDraftTitle(title);
    setDraftMinutes(minutes);
    setDraftModuleId(moduleId);
  };

  const saveEditTask = (id: string) => {
    if (!draftTitle.trim()) return;
    editMicrotask(id, {
      title: draftTitle,
      estimatedMinutes: draftMinutes,
      moduleId: draftModuleId,
    });
    setEditingTaskId(null);
  };

  return (
    <div className="sp-page-container px-5 sm:px-8 py-7 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[var(--sp-border)]">
        <div>
          <p className="text-xs text-[var(--sp-ink-muted)] tabular-nums">
            To-do List · {microtasks.filter((t) => t.completed).length} of {microtasks.length} Completed
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--sp-ink)] mt-1">
            Microtasks & Action Steps
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <VisualRewardStage companionId="then" compact />

          <div className="inline-flex p-1 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
            {(['all', 'active', 'completed'] as TaskFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filter === f
                    ? 'bg-[var(--sp-surface)] text-[var(--sp-ink)] shadow-xs'
                    : 'text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Always-accessible New Microtask Composer */}
      <section
        aria-label="Add microtask"
        className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-5"
      >
        <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Write one concrete microtask (e.g., Summarise page 4 diagram)..."
            aria-label="New microtask title"
            className="md:col-span-6 px-3.5 py-2.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)] placeholder:text-[var(--sp-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sp-accent)]"
          />

          <select
            aria-label="Course module"
            value={newModuleId}
            onChange={(e) => setNewModuleId(e.target.value)}
            className="md:col-span-3 px-3 py-2.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          <select
            aria-label="Estimated minutes"
            value={newMinutes}
            onChange={(e) => setNewMinutes(Number(e.target.value))}
            className="md:col-span-1 px-2.5 py-2.5 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-mono tabular-nums text-[var(--sp-ink)]"
          >
            {[5, 10, 15, 20, 25, 35, 45].map((m) => (
              <option key={m} value={m}>
                {m}m
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="md:col-span-2 px-4 py-2.5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-sm font-semibold hover:opacity-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </form>
      </section>

      {/* Task List: Ticking never disables sibling tasks; all tasks editable */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl bg-[var(--sp-surface)] border border-[var(--sp-border)] p-8 text-center space-y-3">
          <p className="text-sm font-medium text-[var(--sp-ink)]">
            No {filter === 'all' ? '' : filter} tasks right now.
          </p>
          <p className="text-xs text-[var(--sp-ink-muted)]">
            Use the form above to add a task anytime, or switch back to All Tasks.
          </p>
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-xl bg-[var(--sp-accent-soft)] text-[var(--sp-ink)] text-xs font-semibold"
            >
              Show All Tasks
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const stepDraft = newStepByTask[task.id] ?? '';

            return (
              <article
                key={task.id}
                className={`rounded-2xl border p-5 space-y-4 transition-colors ${
                  task.completed
                    ? 'bg-[var(--sp-surface-muted)]/75 border-[var(--sp-border)]'
                    : 'bg-[var(--sp-surface)] border-[var(--sp-border)]'
                }`}
              >
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      aria-label="Edit task title"
                      className="md:col-span-6 px-3 py-2 rounded-xl border border-[var(--sp-accent)] bg-[var(--sp-canvas)] text-sm text-[var(--sp-ink)]"
                    />
                    <select
                      aria-label="Edit task module"
                      value={draftModuleId}
                      onChange={(e) => setDraftModuleId(e.target.value)}
                      className="md:col-span-3 px-2.5 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                    >
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={2}
                      max={120}
                      value={draftMinutes}
                      onChange={(e) => setDraftMinutes(Number(e.target.value))}
                      aria-label="Edit estimated minutes"
                      className="md:col-span-1 px-2.5 py-2 rounded-xl border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs font-mono tabular-nums text-[var(--sp-ink)]"
                    />
                    <div className="md:col-span-2 flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => saveEditTask(task.id)}
                        className="px-3 py-2 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="p-2 rounded-xl border border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]"
                        aria-label="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleMicrotask(task.id)}
                        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                            : 'border-[var(--sp-border)] bg-[var(--sp-canvas)] hover:border-[var(--sp-accent)]'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4" aria-hidden="true" />}
                      </button>

                      <div className="min-w-0">
                        <h2
                          className={`text-base font-semibold leading-snug ${
                            task.completed
                              ? 'line-through text-[var(--sp-ink-muted)]'
                              : 'text-[var(--sp-ink)]'
                          }`}
                        >
                          {task.title}
                        </h2>
                        <p className="text-xs text-[var(--sp-ink-muted)] mt-0.5 tabular-nums">
                          {task.moduleTitle} · {task.estimatedMinutes} min
                          {task.completed && task.completedDate ? ` · Done ${task.completedDate}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startTwoMinuteWarmup(task.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--sp-secondary-soft)] text-[var(--sp-secondary)] text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                      >
                        <Play className="w-3 h-3" />
                        <span>2m Start</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openTaskInFocusStudio(task.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--sp-accent-soft)] text-[var(--sp-ink)] text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                      >
                        <Timer className="w-3 h-3" />
                        <span>Timer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          beginEditTask(task.id, task.title, task.estimatedMinutes, task.moduleId)
                        }
                        aria-label={`Edit "${task.title}"`}
                        className="p-1.5 rounded-lg border border-[var(--sp-border)] text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteMicrotask(task.id)}
                        aria-label={`Delete "${task.title}"`}
                        className="p-1.5 rounded-lg border border-[var(--sp-border)] text-[var(--sp-danger)] hover:bg-[var(--sp-danger-soft)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Substeps */}
                <div className="pl-0 sm:pl-9 space-y-2">
                  {task.substeps.map((step) => {
                    const subKey = `${task.id}:${step.id}`;
                    const editingSub = editingSubstepKey === subKey;
                    return (
                      <div
                        key={step.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--sp-canvas)] border border-[var(--sp-border)]"
                      >
                        {editingSub ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={draftSubstepText}
                              onChange={(e) => setDraftSubstepText(e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded-lg border border-[var(--sp-accent)] bg-[var(--sp-surface)] text-xs text-[var(--sp-ink)]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                editSubstep(task.id, step.id, draftSubstepText);
                                setEditingSubstepKey(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-xs font-semibold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleSubstep(task.id, step.id)}
                              className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                            >
                              <span
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                  step.done
                                    ? 'bg-[var(--sp-accent)] border-[var(--sp-accent)] text-[var(--sp-accent-ink)]'
                                    : 'border-[var(--sp-border)] bg-[var(--sp-surface)]'
                                }`}
                              >
                                {step.done && <Check className="w-3 h-3" />}
                              </span>
                              <span
                                className={`text-xs truncate ${
                                  step.done
                                    ? 'line-through text-[var(--sp-ink-muted)]'
                                    : 'text-[var(--sp-ink)]'
                                }`}
                              >
                                {step.text}
                              </span>
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSubstepKey(subKey);
                                  setDraftSubstepText(step.text);
                                }}
                                aria-label="Edit substep"
                                className="p-1 rounded text-[var(--sp-ink-muted)] hover:text-[var(--sp-ink)]"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSubstep(task.id, step.id)}
                                aria-label="Delete substep"
                                className="p-1 rounded text-[var(--sp-danger)] hover:bg-[var(--sp-danger-soft)]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!stepDraft.trim()) return;
                      addSubstepsToTask(task.id, [stepDraft]);
                      setNewStepByTask((prev) => ({ ...prev, [task.id]: '' }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={stepDraft}
                      onChange={(e) =>
                        setNewStepByTask((prev) => ({ ...prev, [task.id]: e.target.value }))
                      }
                      placeholder="Add tiny step..."
                      aria-label={`Add tiny step to ${task.title}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--sp-border)] bg-[var(--sp-canvas)] text-xs text-[var(--sp-ink)]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[var(--sp-surface-muted)] text-[var(--sp-ink)] text-xs font-medium hover:opacity-90"
                    >
                      + Step
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
