import React from 'react';
import {
  WorkflowProject,
  StepStatus,
} from '../types';
import { calculateWorkflowStats } from '../utils/workflowHelpers';
import { CATEGORY_CONFIGS } from '../data/sampleWorkflows';
import {
  Sparkles,
  Layers,
  FileDown,
  PlusCircle,
  Activity,
  GitCommit,
  ListOrdered,
  Kanban,
  FolderPlus,
  ChevronDown,
  Wand2,
} from 'lucide-react';

interface HeaderProps {
  currentProject: WorkflowProject;
  projects: WorkflowProject[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onOpenBrainDump: () => void;
  onOpenExportImport: () => void;
  onOpenNewStep: () => void;
  viewMode: 'timeline' | 'list' | 'split';
  onChangeViewMode: (mode: 'timeline' | 'list' | 'split') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenNewProject,
  onOpenBrainDump,
  onOpenExportImport,
  onOpenNewStep,
  viewMode,
  onChangeViewMode,
}) => {
  const stats = calculateWorkflowStats(currentProject.steps);
  const activeStep = currentProject.steps.find((s) => s.isCurrent) || currentProject.steps.find((s) => s.status === 'in_motion');
  const catConfig = CATEGORY_CONFIGS[currentProject.category] || CATEGORY_CONFIGS.other;

  return (
    <header className="static w-full border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 space-y-2.5 sm:space-y-3">
        
        {/* Top Row: Brand & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          
          {/* Brand & Project Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
                <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                    Chaotic Classifier
                  </h1>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold tracking-wide bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 hidden xs:inline-block">
                    Workflow
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 hidden xs:block truncate">
                  taming turbulent thoughts
                </p>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

            {/* Project Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 sm:p-1 max-w-[170px] xs:max-w-[210px] sm:max-w-xs">
              <select
                id="project-selector-dropdown"
                value={currentProject.id}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onOpenNewProject();
                  } else {
                    onSelectProject(e.target.value);
                  }
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-200 pl-2 pr-6 py-1 focus:outline-none cursor-pointer appearance-none truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none"
              >
                <optgroup label="Active Projects">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                      {p.title}
                    </option>
                  ))}
                </optgroup>
                <option value="__new__" className="bg-white dark:bg-zinc-900 font-bold text-violet-600 dark:text-violet-400">
                  + New Workflow...
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-5 pointer-events-none mr-1.5" />
              
              <button
                id="btn-quick-new-project"
                onClick={onOpenNewProject}
                title="New Project"
                className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors shrink-0"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Tools & Views: Compact responsive row */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            
            {/* View Mode Segmented Controls - hidden Split on mobile */}
            <div className="inline-flex bg-slate-100 dark:bg-zinc-900 p-0.5 sm:p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] sm:text-xs font-medium shrink-0">
              <button
                id="btn-view-split"
                onClick={() => onChangeViewMode('split')}
                className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Split View</span>
              </button>
              <button
                id="btn-view-timeline"
                onClick={() => onChangeViewMode('timeline')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <GitCommit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                id="btn-view-list"
                onClick={() => onChangeViewMode('list')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <ListOrdered className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Reorder</span>
              </button>
            </div>

            {/* AI Brain Dump Tamer Trigger */}
            <button
              id="btn-tame-brain-dump"
              onClick={onOpenBrainDump}
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-100 transition-all shrink-0"
              title="Convert chaotic brain dumps into structured steps"
            >
              <Wand2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Tame Thoughts</span>
            </button>

            {/* Export / Import Button */}
            <button
              id="btn-export-import"
              onClick={onOpenExportImport}
              className="inline-flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <FileDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
              <span className="hidden xs:inline">Export</span>
            </button>

            {/* Primary Add Step Button */}
            <button
              id="btn-header-add-step"
              onClick={onOpenNewStep}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 transition-all shadow-xs shadow-violet-600/30 shrink-0"
            >
              <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Add Step</span>
            </button>
          </div>
        </div>

        {/* Compact Workflow Telemetry: tight inline row on mobile */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-600 dark:text-zinc-400">
            
            {/* Active Current Step Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] sm:text-xs uppercase font-medium">Focus:</span>
              {activeStep ? (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-zinc-100 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                  <span className="truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[260px]">{activeStep.title}</span>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-zinc-500 italic text-[11px]">None designated</span>
              )}
            </div>

            {/* Turbulence Inline Rating */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-medium">Turbulence:</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {stats.averageChaos}/5 ({stats.turbulenceGrade})
              </span>
            </div>

            {/* Persistent Storage Status Badge */}
            <div
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50"
              title="All workflow tasks, steps, and progress are automatically stored in browser storage"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Auto-Saved</span>
            </div>
          </div>

          {/* Mini Progress Bar with label */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex-1 sm:w-28 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px]">
              {stats.progressPercentage}%
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
