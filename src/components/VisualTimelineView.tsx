import React, { useState } from 'react';
import { WorkflowStep, StepStatus } from '../types';
import { getChaosLevelDetails, getStatusColor } from '../utils/workflowHelpers';
import {
  CheckCircle,
  Play,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Edit3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Compass,
  Zap,
} from 'lucide-react';

interface VisualTimelineViewProps {
  steps: WorkflowStep[];
  onSelectStep: (step: WorkflowStep) => void;
  onUpdateStepStatus: (stepId: string, status: StepStatus) => void;
  onSetCurrentStep: (stepId: string) => void;
  onMoveStep: (fromIndex: number, toIndex: number) => void;
}

export const VisualTimelineView: React.FC<VisualTimelineViewProps> = ({
  steps,
  onSelectStep,
  onUpdateStepStatus,
  onSetCurrentStep,
  onMoveStep,
}) => {
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  if (steps.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
        <Compass className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
          No steps in this workflow yet
        </h3>
        <p className="text-xs text-slate-700 dark:text-zinc-300 mt-1 max-w-sm mx-auto">
          Register your first step above or tame your raw brainstorm to construct an interactive visual timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Visual Timeline Flow</span>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/40">
              {steps.length} Sequenced Milestones
            </span>
          </h2>
          <p className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
            Interactive chronological flow from initial turbulent ideation to polished delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => setLayoutMode('vertical')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                layoutMode === 'vertical'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              Detailed Track
            </button>
            <button
              onClick={() => setLayoutMode('horizontal')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                layoutMode === 'horizontal'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              Panoramic Line
            </button>
          </div>
        </div>
      </div>

      {/* Panoramic Horizontal Mode */}
      {layoutMode === 'horizontal' && (
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex items-center min-w-max gap-3 px-2">
            {steps.map((step, idx) => {
              const statusCfg = getStatusColor(step.status);
              const chaosCfg = getChaosLevelDetails(step.chaosLevel);
              const isSelected = selectedStepId === step.id;

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Card */}
                  <div
                    onClick={() => {
                      setSelectedStepId(step.id);
                      onSelectStep(step);
                    }}
                    className={`group relative w-64 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      step.isCurrent
                        ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 ring-2 ring-violet-400/40 shadow-md'
                        : isSelected
                        ? 'bg-slate-50 dark:bg-zinc-800 border-violet-500'
                        : 'bg-white dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs'
                    }`}
                  >
                    {/* Step Top Bar */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.badge}
                        </span>
                      </div>
                      
                      {step.isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
                          Focus
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-1 mb-1">
                      {step.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3 h-8">
                      {step.description}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
                      <span className="font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {step.tag}
                      </span>
                      <span className={`font-semibold flex items-center gap-1 ${chaosCfg.color}`}>
                        <Flame className="w-3 h-3" />
                        Lvl {step.chaosLevel}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Connector Arrow */}
                  {idx < steps.length - 1 && (
                    <div className="px-2 flex items-center justify-center text-slate-300 dark:text-zinc-700">
                      <div className="w-6 h-0.5 bg-slate-200 dark:bg-zinc-800" />
                      <ChevronRight className="w-4 h-4 -ml-1 text-slate-400 dark:text-zinc-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vertical Detailed Track Mode */}
      {layoutMode === 'vertical' && (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-violet-500 before:via-indigo-500 before:to-emerald-500">
          {steps.map((step, idx) => {
            const statusCfg = getStatusColor(step.status);
            const chaosCfg = getChaosLevelDetails(step.chaosLevel);

            return (
              <div
                key={step.id}
                className="relative group transition-all"
              >
                {/* Timeline Milestone Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    step.status === 'polished'
                      ? 'bg-emerald-500 border-emerald-300 text-white shadow-sm'
                      : step.isCurrent
                      ? 'bg-violet-600 border-white dark:border-zinc-900 text-white ring-4 ring-violet-400/30 scale-110 shadow-md'
                      : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {step.status === 'polished' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <span className="text-[11px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Card Container */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    step.isCurrent
                      ? 'bg-violet-50/60 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700/70 ring-1 ring-violet-400/20 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    
                    {/* Main Step Info */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                          {statusCfg.badge}
                        </span>

                        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
                          {step.tag}
                        </span>

                        <span className={`text-xs font-semibold flex items-center gap-1 ${chaosCfg.color}`}>
                          <Flame className="w-3.5 h-3.5" />
                          <span>Turbulence {step.chaosLevel}/5 ({chaosCfg.label})</span>
                        </span>

                        {step.estimatedMinutes && (
                          <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{step.estimatedMinutes}m</span>
                          </span>
                        )}

                        {step.isCurrent && (
                          <span className="text-xs uppercase font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
                            Current Active Focus
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                        {step.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Checklist & Micro-Notes if available */}
                      {step.notes && step.notes.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                            Checkpoints & Insights:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {step.notes.map((note, nIdx) => (
                              <div
                                key={nIdx}
                                className="text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 px-2.5 py-1 rounded-md text-slate-800 dark:text-zinc-200 flex items-start gap-1.5"
                              >
                                <span className="text-violet-500 font-bold">•</span>
                                <span>{note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fast Quick-Action Buttons */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-zinc-800">
                      
                      {/* Toggle status quickly */}
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                        <button
                          title="Mark In Motion"
                          onClick={() => onUpdateStepStatus(step.id, 'in_motion')}
                          className={`p-1 rounded text-xs transition-colors ${
                            step.status === 'in_motion'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                              : 'text-slate-400 hover:text-indigo-600'
                          }`}
                        >
                          ⚡
                        </button>
                        <button
                          title="Mark Turbulent"
                          onClick={() => onUpdateStepStatus(step.id, 'turbulent')}
                          className={`p-1 rounded text-xs transition-colors ${
                            step.status === 'turbulent'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold'
                              : 'text-slate-400 hover:text-amber-600'
                          }`}
                        >
                          🌪️
                        </button>
                        <button
                          title="Mark Polished / Complete"
                          onClick={() => onUpdateStepStatus(step.id, 'polished')}
                          className={`p-1 rounded text-xs transition-colors ${
                            step.status === 'polished'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'text-slate-400 hover:text-emerald-600'
                          }`}
                        >
                          ✨
                        </button>
                      </div>

                      {/* Set as current focus */}
                      {!step.isCurrent && (
                        <button
                          onClick={() => onSetCurrentStep(step.id)}
                          className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-violet-300 transition-colors"
                        >
                          Set Focus
                        </button>
                      )}

                      {/* Edit full step button */}
                      <button
                        onClick={() => onSelectStep(step)}
                        className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 font-medium px-2 py-1 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
