import React, { useState } from 'react';
import { WorkflowStep, WorkflowProject, StepStatus } from '../types';
import {
  Wand2,
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface BrainDumpTamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorkflowProject;
  onApplySteps: (steps: WorkflowStep[], mode: 'append' | 'replace') => void;
}

interface ClassifiedStepCandidate {
  title: string;
  description: string;
  status: StepStatus;
  chaosLevel: number;
  tag: string;
  estimatedMinutes?: number;
  notes?: string[];
  selected?: boolean;
}

export const BrainDumpTamerModal: React.FC<BrainDumpTamerModalProps> = ({
  isOpen,
  onClose,
  project,
  onApplySteps,
}) => {
  if (!isOpen) return null;

  const [brainDumpText, setBrainDumpText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [classifiedCandidates, setClassifiedCandidates] = useState<ClassifiedStepCandidate[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const handleTameThoughts = async () => {
    if (!brainDumpText.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);
    setClassifiedCandidates([]);

    try {
      const res = await fetch('/api/tame-thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brainDump: brainDumpText,
          projectTitle: project.title,
          projectType: project.category,
          currentSteps: project.steps.map((s) => ({
            title: s.title,
            status: s.status,
            tag: s.tag,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to classify turbulent thoughts.');
      }

      const data = await res.json();
      setSummary(data.summary || 'Classified into ordered workflow milestones.');
      setClassifiedCandidates(
        (data.steps || []).map((s: any) => ({
          ...s,
          selected: true,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while communicating with Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCandidate = (index: number) => {
    setClassifiedCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleApply = () => {
    const selected = classifiedCandidates.filter((c) => c.selected);
    if (selected.length === 0) return;

    const newWorkflowSteps: WorkflowStep[] = selected.map((c, idx) => ({
      id: `step-tamed-${Date.now()}-${idx}`,
      title: c.title,
      description: c.description,
      status: c.status,
      chaosLevel: c.chaosLevel || 3,
      tag: c.tag || 'General',
      estimatedMinutes: c.estimatedMinutes,
      notes: c.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    onApplySteps(newWorkflowSteps, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Tame Turbulent Thoughts
              </h3>
              <p className="text-xs text-slate-700 dark:text-zinc-300">
                Paste unstructured brainstorms, raw ideas, or meeting notes to classify into steps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          
          {/* Text Area Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Raw Brain Dump / Chaotic Stream of Consciousness
            </label>
            <textarea
              rows={4}
              value={brainDumpText}
              onChange={(e) => setBrainDumpText(e.target.value)}
              placeholder="e.g. I need to make the chorus louder, then add a highpass filter on the guitar track, also rewrite the auth database queries so users don't get logged out randomly, and test on staging..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Action to trigger AI */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-700 dark:text-zinc-300">
              Powered by server-side Gemini 3.7 Flash classification
            </span>

            <button
              type="button"
              onClick={handleTameThoughts}
              disabled={isLoading || !brainDumpText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 shadow-sm shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Taming Turbulence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Structure & Classify Steps</span>
                </>
              )}
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Classification issue:</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Classified Results Preview */}
          {classifiedCandidates.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              {summary && (
                <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{summary}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Select Classified Steps to Import ({classifiedCandidates.filter((c) => c.selected).length}/{classifiedCandidates.length})
                </span>
                
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer text-slate-600 dark:text-zinc-400">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-violet-600"
                    />
                    <span>Append to End</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-600 dark:text-zinc-400">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-violet-600"
                    />
                    <span>Replace All</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {classifiedCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleCandidate(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                      cand.selected
                        ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(cand.selected)}
                          onChange={() => handleToggleCandidate(idx)}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
                        />
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {idx + 1}. {cand.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-medium bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                          {cand.tag}
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Lvl {cand.chaosLevel}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 pl-6">
                      {cand.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          {classifiedCandidates.length > 0 && (
            <button
              type="button"
              onClick={handleApply}
              disabled={classifiedCandidates.filter((c) => c.selected).length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 shadow-sm transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Import Selected Steps ({classifiedCandidates.filter((c) => c.selected).length})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
