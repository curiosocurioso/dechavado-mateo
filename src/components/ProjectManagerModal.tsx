import React, { useState } from 'react';
import { WorkflowProject, ProjectCategory } from '../types';
import { CATEGORY_CONFIGS } from '../data/sampleWorkflows';
import {
  X,
  Plus,
  FolderPlus,
  Music,
  Terminal,
  BookOpen,
  Palette,
  Film,
  Search,
  Sparkles,
  Trash2,
  Copy,
} from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WorkflowProject[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Omit<WorkflowProject, 'id' | 'createdAt' | 'updatedAt' | 'steps'>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('app');
  const [color, setColor] = useState('#8b5cf6');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateProject({
      title: title.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim() || 'Workflow project registered in Chaotic Classifier.',
      category,
      color,
    });

    setTitle('');
    setTagline('');
    setDescription('');
    setIsCreatingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {isCreatingNew ? 'Create New Workflow Project' : 'Workflow Workspace Manager'}
              </h3>
              <p className="text-xs text-slate-700 dark:text-zinc-300">
                Switch between songs, apps, writings, or spin up a new classifier.
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {!isCreatingNew ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Registered Projects ({projects.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Workflow</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {projects.map((proj) => {
                  const cat = CATEGORY_CONFIGS[proj.category] || CATEGORY_CONFIGS.other;
                  const isCurrent = proj.id === currentProjectId;

                  return (
                    <div
                      key={proj.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 ring-1 ring-violet-400 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div
                        onClick={() => {
                          onSelectProject(proj.id);
                          onClose();
                        }}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {cat.label}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {proj.steps.length} steps
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {proj.title}
                        </h4>
                        {proj.tagline && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {proj.tagline}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(proj.id);
                              onClose();
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors"
                          >
                            Open
                          </button>
                        )}
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete project "${proj.title}" and all its recorded steps?`)) {
                                onDeleteProject(proj.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Song: Electric Solitude, App: NextGen Kanban, Novel: Chapter 4..."
                  className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Tagline / Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. 80s Synthwave Single, iOS Swift Prototype..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_CONFIGS) as ProjectCategory[]).map((catKey) => {
                    const cfg = CATEGORY_CONFIGS[catKey];
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setCategory(catKey)}
                        className={`text-xs p-2.5 rounded-xl border text-left font-medium transition-all ${
                          category === catKey
                            ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-900 dark:text-violet-200 ring-1 ring-violet-500'
                            : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="font-bold">{cfg.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Goal & Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this workflow accomplishes..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  Create & Open
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
