import React, { useState, useEffect } from 'react';
import { WorkflowStep, StepStatus, ProjectCategory } from '../types';
import { CATEGORY_CONFIGS } from '../data/sampleWorkflows';
import { getChaosLevelDetails, getStatusColor } from '../utils/workflowHelpers';
import {
  Plus,
  Zap,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Flame,
  Layers,
  ArrowDownToLine,
  Sliders,
  CheckSquare,
  X,
  Save,
  RotateCcw,
} from 'lucide-react';

const DRAFT_STORAGE_PREFIX = 'chaotic_classifier_draft_';

interface StepRegistrationSectionProps {
  category: ProjectCategory;
  onAddStep: (step: Omit<WorkflowStep, 'id' | 'createdAt' | 'updatedAt'>, insertPosition?: 'end' | 'after_current' | 'start') => void;
  currentStepCount: number;
  onOpenReorganizeView?: () => void;
  lastSavedAt?: Date | null;
}

export const StepRegistrationSection: React.FC<StepRegistrationSectionProps> = ({
  category,
  onAddStep,
  currentStepCount,
  onOpenReorganizeView,
  lastSavedAt,
}) => {
  const catConfig = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.other;
  const draftKey = `${DRAFT_STORAGE_PREFIX}${category}`;

  // Load existing draft if present
  const [title, setTitle] = useState(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return parsed.title || '';
      }
    } catch {}
    return '';
  });

  const [description, setDescription] = useState(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return parsed.description || '';
      }
    } catch {}
    return '';
  });

  const [status, setStatus] = useState<StepStatus>(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return parsed.status || 'in_motion';
      }
    } catch {}
    return 'in_motion';
  });

  const [chaosLevel, setChaosLevel] = useState<number>(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (typeof parsed.chaosLevel === 'number') return parsed.chaosLevel;
      }
    } catch {}
    return 3;
  });

  const [selectedTag, setSelectedTag] = useState<string>(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.selectedTag) return parsed.selectedTag;
      }
    } catch {}
    return catConfig.defaultTags[0] || 'Execution';
  });

  const [customTag, setCustomTag] = useState(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return parsed.customTag || '';
      }
    } catch {}
    return '';
  });

  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.estimatedMinutes !== undefined) return parsed.estimatedMinutes;
      }
    } catch {}
    return 45;
  });

  const [isCurrent, setIsCurrent] = useState<boolean>(true);
  const [insertPosition, setInsertPosition] = useState<'end' | 'after_current' | 'start'>('end');
  
  // Checklist / sub-notes
  const [notes, setNotes] = useState<string[]>(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (Array.isArray(parsed.notes)) return parsed.notes;
      }
    } catch {}
    return [];
  });
  const [noteInput, setNoteInput] = useState('');
  const [isExpandedDetails, setIsExpandedDetails] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);

  // Auto-save form draft as user inputs
  useEffect(() => {
    if (title || description || customTag || notes.length > 0) {
      setHasUnsavedDraft(true);
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            title,
            description,
            status,
            chaosLevel,
            selectedTag,
            customTag,
            estimatedMinutes,
            notes,
          })
        );
      } catch (e) {
        console.error('Failed to auto-save task input draft:', e);
      }
    } else {
      setHasUnsavedDraft(false);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
    }
  }, [title, description, status, chaosLevel, selectedTag, customTag, estimatedMinutes, notes, draftKey]);

  const handleClearDraft = () => {
    setTitle('');
    setDescription('');
    setNotes([]);
    setCustomTag('');
    setStatus('in_motion');
    setChaosLevel(3);
    setEstimatedMinutes(45);
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    setHasUnsavedDraft(false);
  };

  const chaosDetails = getChaosLevelDetails(chaosLevel);

  const handleAddNote = () => {
    if (noteInput.trim()) {
      setNotes([...notes, noteInput.trim()]);
      setNoteInput('');
    }
  };

  const handleRemoveNote = (idx: number) => {
    setNotes(notes.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent, chainAnother: boolean = false) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalTag = customTag.trim() || selectedTag;

    onAddStep(
      {
        title: title.trim(),
        description: description.trim() || 'No detailed notes provided for this step yet.',
        status,
        chaosLevel,
        tag: finalTag,
        estimatedMinutes: estimatedMinutes === '' ? undefined : Number(estimatedMinutes),
        notes: notes.length > 0 ? notes : undefined,
        isCurrent,
        completedAt: status === 'polished' ? new Date().toISOString() : undefined,
      },
      insertPosition
    );

    setSuccessNotice(`Task "${title.trim()}" successfully stored & saved!`);
    setTimeout(() => setSuccessNotice(null), 3500);

    // Clear saved draft from localStorage
    try {
      localStorage.removeItem(draftKey);
    } catch {}

    // Reset or prepare next step
    setTitle('');
    setDescription('');
    setNotes([]);
    setCustomTag('');
    setHasUnsavedDraft(false);

    if (!chainAnother) {
      setIsCurrent(false);
    } else {
      setStatus('in_motion');
      setIsCurrent(true);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Decorative gradient highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Register Workflow Step</span>
            <span className="text-xs font-normal text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
              Step #{currentStepCount + 1}
            </span>
          </h2>
          <p className="text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mt-0.5">
            <span>Log the step you are currently on, define its objectives, and control turbulence.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenReorganizeView && (
            <button
              type="button"
              onClick={onOpenReorganizeView}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 self-start sm:self-auto bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800/40"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Reorder</span>
            </button>
          )}
        </div>
      </div>

      {hasUnsavedDraft && (
        <div className="mb-3 px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-center justify-between text-amber-900 dark:text-amber-200 animate-fade-in">
          <span className="flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Draft auto-saved to browser storage</span>
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Draft</span>
          </button>
        </div>
      )}

      {successNotice && (
        <div className="mb-4 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {successNotice}
          </span>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        
        {/* Step Title Input */}
        <div>
          <label htmlFor="step-title-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Step Name / Action on Deck <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="step-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Synthesize Bassline Melodies, Build Auth Middleware, Record Vocal Harmonies..."
              className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700/80 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Step Description Input */}
        <div>
          <label htmlFor="step-desc-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Description, Objectives & Execution Details
          </label>
          <textarea
            id="step-desc-input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe key decisions, tools used, sonic/visual goals, or technical requirements..."
            className="w-full text-sm px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700/80 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-y min-h-[64px]"
          />
        </div>

        {/* Primary Controls: Status & Chaos Turbulence */}
        <div className="space-y-4 pt-1">
          
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Current Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'in_motion', icon: '⚡', label: 'In Motion', desc: 'Active Focus' },
                  { id: 'turbulent', icon: '🌪️', label: 'Turbulent', desc: 'Raw Idea' },
                  { id: 'polished', icon: '✨', label: 'Polished', desc: 'Completed' },
                  { id: 'parked', icon: '🧊', label: 'Parked', desc: 'On Hold' },
                ] as const
              ).map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStatus(st.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none min-w-0 ${
                    status === st.id
                      ? 'bg-violet-50 dark:bg-violet-950/70 border-violet-500 dark:border-violet-500 text-violet-950 dark:text-violet-100 ring-2 ring-violet-500/30 shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-base leading-none mb-1">{st.icon}</span>
                  <span className="text-xs font-bold leading-tight truncate w-full px-1">{st.label}</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight mt-0.5 truncate w-full px-1">
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chaos / Turbulence Level Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="step-chaos-slider" className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Flame className={`w-3.5 h-3.5 ${chaosDetails.color}`} />
                <span>Turbulence Level: {chaosLevel}/5</span>
              </label>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 ${chaosDetails.color}`}>
                {chaosDetails.label}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/50 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
              <input
                id="step-chaos-slider"
                type="range"
                min="1"
                max="5"
                step="1"
                value={chaosLevel}
                onChange={(e) => setChaosLevel(parseInt(e.target.value, 10))}
                className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-600 dark:text-zinc-400 font-medium mt-1.5 px-0.5">
                <span>1 (Clear)</span>
                <span>2 (Mild)</span>
                <span>3 (Moderate)</span>
                <span>4 (Turbulent)</span>
                <span>5 (Storm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Options (Category Tags, Estimated Time, Checklist) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsExpandedDetails(!isExpandedDetails)}
            className="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-violet-500" />
            <span>{isExpandedDetails ? 'Hide additional step metadata' : 'Configure tags, time estimate & checklist points...'}</span>
          </button>

          {isExpandedDetails && (
            <div className="mt-3 p-4 bg-slate-50/80 dark:bg-zinc-950/40 rounded-xl border border-slate-200 dark:border-zinc-800/80 space-y-4 animate-fade-in">
              
              {/* Tag & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>Workflow Stage / Tag</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {catConfig.defaultTags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setCustomTag('');
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md transition-all font-medium ${
                          selectedTag === tag && !customTag
                            ? 'bg-violet-600 text-white'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                {/* Estimated Minutes & Insertion Position */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Estimated Duration (Minutes)</span>
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      placeholder="e.g. 45"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Step Insertion Order
                    </label>
                    <select
                      value={insertPosition}
                      onChange={(e) => setInsertPosition(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="end">Add at end of workflow (Default)</option>
                      <option value="after_current">Insert right after current active step</option>
                      <option value="start">Insert at the very top (#1)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checklist & Micro-notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-slate-400" />
                  <span>Sub-items / Checklist Observations</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    placeholder="Add a pointer, checklist item, or test note..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {notes.length > 0 && (
                  <ul className="space-y-1">
                    {notes.map((note, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-slate-800 dark:text-zinc-200"
                      >
                        <span className="truncate mr-2">• {note}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNote(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Focus & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 dark:border-zinc-700 accent-violet-600"
            />
            <span className="font-medium">Set as my current active focus step</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-add-and-chain"
              onClick={(e) => handleSubmit(e, true)}
              disabled={!title.trim()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-zinc-700"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-violet-500" />
              <span>Save & Add Another Step</span>
            </button>

            <button
              type="submit"
              id="btn-register-step-submit"
              disabled={!title.trim()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 transition-all shadow-sm shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Register Step</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
