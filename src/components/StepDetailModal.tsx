import React, { useState, useEffect } from 'react';
import { WorkflowStep, StepStatus, ProjectCategory } from '../types';
import { CATEGORY_CONFIGS } from '../data/sampleWorkflows';
import { getChaosLevelDetails, getStatusColor } from '../utils/workflowHelpers';
import {
  X,
  Save,
  Trash2,
  Flame,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface StepDetailModalProps {
  step: WorkflowStep | null;
  category: ProjectCategory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStep: WorkflowStep) => void;
  onDelete: (stepId: string) => void;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  step,
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !step) return null;

  const catConfig = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.other;

  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description);
  const [status, setStatus] = useState<StepStatus>(step.status);
  const [chaosLevel, setChaosLevel] = useState<number>(step.chaosLevel || 1);
  const [tag, setTag] = useState<string>(step.tag);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>(step.estimatedMinutes ?? '');
  const [isCurrent, setIsCurrent] = useState<boolean>(Boolean(step.isCurrent));
  
  const [notes, setNotes] = useState<string[]>(step.notes || []);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (step) {
      setTitle(step.title);
      setDescription(step.description);
      setStatus(step.status);
      setChaosLevel(step.chaosLevel || 1);
      setTag(step.tag);
      setEstimatedMinutes(step.estimatedMinutes ?? '');
      setIsCurrent(Boolean(step.isCurrent));
      setNotes(step.notes || []);
    }
  }, [step]);

  const chaosDetails = getChaosLevelDetails(chaosLevel);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      ...step,
      title: title.trim(),
      description: description.trim(),
      status,
      chaosLevel,
      tag: tag.trim() || 'General',
      estimatedMinutes: estimatedMinutes === '' ? undefined : Number(estimatedMinutes),
      isCurrent,
      notes: notes.length > 0 ? notes : undefined,
      completedAt: status === 'polished' ? (step.completedAt || new Date().toISOString()) : undefined,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-violet-600 dark:text-violet-400">
              Workflow Step Inspector
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 truncate max-w-md">
              Edit: {title || 'Untitled Step'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Step Name / Action Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Description & Action Items
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
          </div>

          {/* Status & Chaos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Step Status
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'in_motion', label: '⚡ In Motion' },
                    { id: 'turbulent', label: '🌪️ Turbulent' },
                    { id: 'polished', label: '✨ Polished' },
                    { id: 'parked', label: '🧊 Parked' },
                  ] as const
                ).map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setStatus(st.id)}
                    className={`text-xs px-2.5 py-2 rounded-lg border text-center font-medium transition-all ${
                      status === st.id
                        ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-900 dark:text-violet-200 ring-1 ring-violet-500'
                        : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Flame className={`w-3.5 h-3.5 ${chaosDetails.color}`} />
                  <span>Turbulence Level: {chaosLevel}/5</span>
                </label>
                <span className={`text-[11px] font-semibold ${chaosDetails.color}`}>
                  {chaosDetails.label}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={chaosLevel}
                  onChange={(e) => setChaosLevel(parseInt(e.target.value, 10))}
                  className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-slate-700 dark:text-zinc-300 font-medium mt-1">
                  <span>1 (Clear)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Storm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Category Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Composition, Frontend, Mixing..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Est. Duration (Minutes)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Sub-item / Checklist notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Checkpoints & Micro-Notes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Add checklist observation..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </div>

            {notes.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {notes.map((n, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs px-2.5 py-1 bg-slate-50 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    <span className="truncate mr-2">• {n}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(i)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Focus Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-zinc-300 pt-2">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
            />
            <span className="font-semibold">Mark this as my active focus step</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete step "${step.title}"?`)) {
                onDelete(step.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Step</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 shadow-sm shadow-violet-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
