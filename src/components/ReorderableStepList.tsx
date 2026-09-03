import React, { useState } from 'react';
import { WorkflowStep, StepStatus } from '../types';
import { getChaosLevelDetails, getStatusColor } from '../utils/workflowHelpers';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Flame,
  Search,
  Filter,
  Check,
  Zap,
  MoreVertical,
} from 'lucide-react';

interface ReorderableStepListProps {
  steps: WorkflowStep[];
  onReorder: (newSteps: WorkflowStep[]) => void;
  onSelectStep: (step: WorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
  onDuplicateStep: (step: WorkflowStep) => void;
  onUpdateStepStatus: (stepId: string, status: StepStatus) => void;
  onSetCurrentStep: (stepId: string) => void;
  onMoveStep: (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

export const ReorderableStepList: React.FC<ReorderableStepListProps> = ({
  steps,
  onReorder,
  onSelectStep,
  onDeleteStep,
  onDuplicateStep,
  onUpdateStepStatus,
  onSetCurrentStep,
  onMoveStep,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StepStatus>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Unique tags for filtering
  const allTags = Array.from(new Set(steps.map((s) => s.tag).filter(Boolean)));

  const filteredSteps = steps.filter((step) => {
    const matchesSearch =
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || step.status === statusFilter;
    const matchesTag = tagFilter === 'all' || step.tag === tagFilter;
    return matchesSearch && matchesStatus && matchesTag;
  });

  const isFiltering = searchQuery.trim() !== '' || statusFilter !== 'all' || tagFilter !== 'all';

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag ghost or standard
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...steps];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    onReorder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      
      {/* Header & Reorganization Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Reorganize & Sort Steps</span>
            <span className="text-xs font-normal text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
              {steps.length} Steps in Sequence
            </span>
          </h2>
          <p className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
            Drag any card by its grip handle to reposition or use the directional move arrows.
          </p>
        </div>

        {isFiltering && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 self-start sm:self-auto bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/40">
            <span>Filtered view ({filteredSteps.length}/{steps.length}). Clear filters to drag-sort the full sequence.</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search steps by title, description or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="in_motion">⚡ In Motion</option>
          <option value="turbulent">🌪️ Turbulent</option>
          <option value="polished">✨ Polished</option>
          <option value="parked">🧊 Parked</option>
        </select>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="all">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Steps List */}
      {steps.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-950/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
          <p className="font-semibold text-slate-700 dark:text-zinc-300">No steps in this workflow queue yet</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Use the register form above to log your first step.</p>
        </div>
      ) : filteredSteps.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
          No steps match the current search or filters.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSteps.map((step, filteredIdx) => {
            // Find real original index in full steps array
            const originalIndex = steps.findIndex((s) => s.id === step.id);
            const statusCfg = getStatusColor(step.status);
            const chaosCfg = getChaosLevelDetails(step.chaosLevel);
            const isDragging = draggedIndex === originalIndex;
            const isOver = dragOverIndex === originalIndex;

            return (
              <div
                key={step.id}
                draggable={!isFiltering}
                onDragStart={(e) => handleDragStart(e, originalIndex)}
                onDragOver={(e) => handleDragOver(e, originalIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, originalIndex)}
                onDragEnd={handleDragEnd}
                className={`relative rounded-xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDragging
                    ? 'opacity-40 border-violet-400 bg-violet-50 dark:bg-violet-950/30'
                    : isOver
                    ? 'border-violet-500 bg-violet-50/80 dark:bg-violet-950/60 ring-2 ring-violet-400'
                    : step.isCurrent
                    ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-300 dark:border-violet-800 ring-1 ring-violet-400/30 shadow-xs'
                    : 'bg-white dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Left Drag Handle & Sequence Number */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    title={isFiltering ? 'Clear filters to drag' : 'Drag to reorder step'}
                    className={`flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 ${
                      isFiltering ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <GripVertical className="w-4 h-4" />
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center ml-1">
                      {originalIndex + 1}
                    </span>
                  </div>

                  {/* Step Title, Badges & Snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        {statusCfg.badge}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {step.tag}
                      </span>
                      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${chaosCfg.color}`}>
                        <Flame className="w-3 h-3" />
                        Lvl {step.chaosLevel}
                      </span>
                      {step.isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/80 px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
                          Current Step
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => onSelectStep(step)}
                      className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer"
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Right Action Tools: Reorder Buttons & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800/80">
                  
                  {/* Up/Down Step Reorder Arrows */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700/60">
                    <button
                      type="button"
                      disabled={originalIndex === 0}
                      onClick={() => onMoveStep(originalIndex, 'up')}
                      title="Move Step Up"
                      className="p-1 text-slate-600 dark:text-zinc-300 hover:text-violet-600 hover:bg-white dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={originalIndex === steps.length - 1}
                      onClick={() => onMoveStep(originalIndex, 'down')}
                      title="Move Step Down"
                      className="p-1 text-slate-600 dark:text-zinc-300 hover:text-violet-600 hover:bg-white dark:hover:bg-zinc-700 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Fast Status Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus: StepStatus =
                        step.status === 'in_motion'
                          ? 'polished'
                          : step.status === 'polished'
                          ? 'turbulent'
                          : step.status === 'turbulent'
                          ? 'parked'
                          : 'in_motion';
                      onUpdateStepStatus(step.id, nextStatus);
                    }}
                    title="Cycle status"
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded text-slate-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    Cycle Status
                  </button>

                  {/* Set Focus */}
                  {!step.isCurrent && (
                    <button
                      type="button"
                      onClick={() => onSetCurrentStep(step.id)}
                      title="Set as Current Focus"
                      className="text-xs px-2 py-1 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 rounded border border-violet-200 dark:border-violet-800/40 transition-colors font-medium"
                    >
                      Focus
                    </button>
                  )}

                  {/* Edit / Inspect */}
                  <button
                    type="button"
                    onClick={() => onSelectStep(step)}
                    title="Edit Step"
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => onDuplicateStep(step)}
                    title="Duplicate Step"
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete step "${step.title}"?`)) {
                        onDeleteStep(step.id);
                      }
                    }}
                    title="Delete Step"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
