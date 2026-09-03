/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WorkflowProject, WorkflowStep, StepStatus } from './types';
import { INITIAL_PROJECTS } from './data/sampleWorkflows';
import { Header } from './components/Header';
import { StepRegistrationSection } from './components/StepRegistrationSection';
import { VisualTimelineView } from './components/VisualTimelineView';
import { ReorderableStepList } from './components/ReorderableStepList';
import { StepDetailModal } from './components/StepDetailModal';
import { BrainDumpTamerModal } from './components/BrainDumpTamerModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ExportImportModal } from './components/ExportImportModal';
import {
  Sparkles,
  Plus,
  GitCommit,
  Layers,
  ListOrdered,
  Activity,
  Wand2,
  FolderOpen,
} from 'lucide-react';

const STORAGE_KEY = 'chaotic_classifier_projects_v1';
const ACTIVE_PROJ_KEY = 'chaotic_classifier_active_id_v1';

const DEFAULT_SAMPLE_STEP_IDS = new Set([
  'step-1',
  'step-2',
  'step-3',
  'step-4',
  'step-5',
  'step-app-1',
  'step-app-2',
  'step-app-3',
]);

export default function App() {
  const [projects, setProjects] = useState<WorkflowProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean out default sample steps while preserving any user-added steps
          const cleaned = parsed.map((proj: WorkflowProject) => ({
            ...proj,
            steps: Array.isArray(proj.steps)
              ? proj.steps.filter((s) => !DEFAULT_SAMPLE_STEP_IDS.has(s.id))
              : [],
          }));
          return cleaned;
        }
      }
    } catch (e) {
      console.error('Failed to load projects from storage:', e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROJ_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load active project id:', e);
    }
    return INITIAL_PROJECTS[0]?.id || 'default';
  });

  const [viewMode, setViewMode] = useState<'split' | 'timeline' | 'list'>('split');
  
  // Modals & Drawers state
  const [inspectingStep, setInspectingStep] = useState<WorkflowStep | null>(null);
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  const registrationSectionRef = useRef<HTMLDivElement | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to persist projects:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_PROJ_KEY, activeProjectId);
    } catch (e) {
      console.error('Failed to persist active project id:', e);
    }
  }, [activeProjectId]);

  // Current active project
  const currentProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  // Helper to update current project's steps
  const updateCurrentProjectSteps = (newSteps: WorkflowStep[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProject.id
          ? {
              ...p,
              steps: newSteps,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  // Add a new step
  const handleAddStep = (
    stepData: Omit<WorkflowStep, 'id' | 'createdAt' | 'updatedAt'>,
    insertPosition: 'end' | 'after_current' | 'start' = 'end'
  ) => {
    const newStep: WorkflowStep = {
      ...stepData,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedSteps = [...currentProject.steps];

    // If new step is marked current, un-mark others
    if (newStep.isCurrent) {
      updatedSteps = updatedSteps.map((s) => ({ ...s, isCurrent: false }));
    }

    if (insertPosition === 'start') {
      updatedSteps.unshift(newStep);
    } else if (insertPosition === 'after_current') {
      const activeIdx = updatedSteps.findIndex((s) => s.isCurrent);
      if (activeIdx !== -1) {
        updatedSteps.splice(activeIdx + 1, 0, newStep);
      } else {
        updatedSteps.push(newStep);
      }
    } else {
      updatedSteps.push(newStep);
    }

    updateCurrentProjectSteps(updatedSteps);
  };

  // Update a step
  const handleSaveStep = (updatedStep: WorkflowStep) => {
    let updatedSteps = currentProject.steps.map((s) =>
      s.id === updatedStep.id ? updatedStep : s
    );

    if (updatedStep.isCurrent) {
      updatedSteps = updatedSteps.map((s) =>
        s.id === updatedStep.id ? s : { ...s, isCurrent: false }
      );
    }

    updateCurrentProjectSteps(updatedSteps);
  };

  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = currentProject.steps.filter((s) => s.id !== stepId);
    updateCurrentProjectSteps(updatedSteps);
  };

  // Duplicate a step
  const handleDuplicateStep = (step: WorkflowStep) => {
    const duplicated: WorkflowStep = {
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${step.title} (Copy)`,
      isCurrent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const originalIdx = currentProject.steps.findIndex((s) => s.id === step.id);
    const updatedSteps = [...currentProject.steps];
    if (originalIdx !== -1) {
      updatedSteps.splice(originalIdx + 1, 0, duplicated);
    } else {
      updatedSteps.push(duplicated);
    }

    updateCurrentProjectSteps(updatedSteps);
  };

  // Update single step status
  const handleUpdateStepStatus = (stepId: string, status: StepStatus) => {
    const updatedSteps = currentProject.steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          status,
          completedAt: status === 'polished' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    updateCurrentProjectSteps(updatedSteps);
  };

  // Set step as the active focus step
  const handleSetCurrentStep = (stepId: string) => {
    const updatedSteps = currentProject.steps.map((s) => ({
      ...s,
      isCurrent: s.id === stepId,
    }));
    updateCurrentProjectSteps(updatedSteps);
  };

  // Directional move step
  const handleMoveStep = (
    index: number,
    direction: 'up' | 'down' | 'top' | 'bottom'
  ) => {
    const updatedSteps = [...currentProject.steps];
    const [item] = updatedSteps.splice(index, 1);

    if (direction === 'up' && index > 0) {
      updatedSteps.splice(index - 1, 0, item);
    } else if (direction === 'down' && index < currentProject.steps.length - 1) {
      updatedSteps.splice(index + 1, 0, item);
    } else if (direction === 'top') {
      updatedSteps.unshift(item);
    } else if (direction === 'bottom') {
      updatedSteps.push(item);
    } else {
      updatedSteps.splice(index, 0, item);
    }

    updateCurrentProjectSteps(updatedSteps);
  };

  // AI Brain Dump steps importer
  const handleApplyBrainDumpSteps = (
    newSteps: WorkflowStep[],
    mode: 'append' | 'replace'
  ) => {
    if (mode === 'replace') {
      updateCurrentProjectSteps(newSteps);
    } else {
      updateCurrentProjectSteps([...currentProject.steps, ...newSteps]);
    }
  };

  // Create new project
  const handleCreateProject = (
    projData: Omit<WorkflowProject, 'id' | 'createdAt' | 'updatedAt' | 'steps'>
  ) => {
    const newProj: WorkflowProject = {
      ...projData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    const remaining = projects.filter((p) => p.id !== projectId);
    if (remaining.length > 0) {
      setProjects(remaining);
      if (activeProjectId === projectId) {
        setActiveProjectId(remaining[0].id);
      }
    }
  };

  // Import whole project from JSON
  const handleImportProject = (imported: WorkflowProject) => {
    setProjects((prev) => [imported, ...prev]);
    setActiveProjectId(imported.id);
  };

  const scrollToRegistration = () => {
    if (registrationSectionRef.current) {
      registrationSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-violet-500 selection:text-white">
      
      {/* Unpinned/Static Header */}
      <Header
        currentProject={currentProject}
        projects={projects}
        onSelectProject={setActiveProjectId}
        onOpenNewProject={() => setIsProjectManagerOpen(true)}
        onOpenBrainDump={() => setIsBrainDumpOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenNewStep={() => {
          if (viewMode === 'list') {
            setViewMode('split');
          }
          scrollToRegistration();
        }}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Project Header Banner */}
        <div className="bg-gradient-to-r from-violet-900/10 via-indigo-900/10 to-slate-900/10 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-zinc-900/40 border border-violet-200/60 dark:border-violet-800/30 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400">
                Active Workflow Register
              </span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-semibold bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                {currentProject.category.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {currentProject.title}
            </h2>
            {currentProject.tagline && (
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400">
                {currentProject.tagline}
              </p>
            )}
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => setIsBrainDumpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-50 dark:hover:bg-violet-950/60 transition-colors shadow-xs"
            >
              <Wand2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Tame Thoughts</span>
            </button>

            <button
              onClick={() => setIsProjectManagerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>All Workflows</span>
            </button>
          </div>
        </div>

        {/* View Layout Switcher - In mobile (< md), always single column vertical stack */}
        {viewMode === 'split' && (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Left Column: Register Step & Reorderable List */}
            <div className="w-full md:col-span-5 space-y-5 sm:space-y-6" ref={registrationSectionRef}>
              <StepRegistrationSection
                category={currentProject.category}
                onAddStep={handleAddStep}
                currentStepCount={currentProject.steps.length}
                onOpenReorganizeView={() => setViewMode('list')}
              />

              <ReorderableStepList
                steps={currentProject.steps}
                onReorder={updateCurrentProjectSteps}
                onSelectStep={(step) => setInspectingStep(step)}
                onDeleteStep={handleDeleteStep}
                onDuplicateStep={handleDuplicateStep}
                onUpdateStepStatus={handleUpdateStepStatus}
                onSetCurrentStep={handleSetCurrentStep}
                onMoveStep={handleMoveStep}
              />
            </div>

            {/* Right Column: Interactive Visual Timeline */}
            <div className="w-full md:col-span-7">
              <VisualTimelineView
                steps={currentProject.steps}
                onSelectStep={(step) => setInspectingStep(step)}
                onUpdateStepStatus={handleUpdateStepStatus}
                onSetCurrentStep={handleSetCurrentStep}
                onMoveStep={(from, to) => handleMoveStep(from, to > from ? 'down' : 'up')}
              />
            </div>

          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-6">
            <div ref={registrationSectionRef}>
              <StepRegistrationSection
                category={currentProject.category}
                onAddStep={handleAddStep}
                currentStepCount={currentProject.steps.length}
                onOpenReorganizeView={() => setViewMode('list')}
              />
            </div>

            <VisualTimelineView
              steps={currentProject.steps}
              onSelectStep={(step) => setInspectingStep(step)}
              onUpdateStepStatus={handleUpdateStepStatus}
              onSetCurrentStep={handleSetCurrentStep}
              onMoveStep={(from, to) => handleMoveStep(from, to > from ? 'down' : 'up')}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-6">
            <div ref={registrationSectionRef}>
              <StepRegistrationSection
                category={currentProject.category}
                onAddStep={handleAddStep}
                currentStepCount={currentProject.steps.length}
              />
            </div>

            <ReorderableStepList
              steps={currentProject.steps}
              onReorder={updateCurrentProjectSteps}
              onSelectStep={(step) => setInspectingStep(step)}
              onDeleteStep={handleDeleteStep}
              onDuplicateStep={handleDuplicateStep}
              onUpdateStepStatus={handleUpdateStepStatus}
              onSetCurrentStep={handleSetCurrentStep}
              onMoveStep={handleMoveStep}
            />
          </div>
        )}

      </main>

      {/* Modals */}
      <StepDetailModal
        isOpen={Boolean(inspectingStep)}
        step={inspectingStep}
        category={currentProject.category}
        onClose={() => setInspectingStep(null)}
        onSave={handleSaveStep}
        onDelete={handleDeleteStep}
      />

      <BrainDumpTamerModal
        isOpen={isBrainDumpOpen}
        onClose={() => setIsBrainDumpOpen(false)}
        project={currentProject}
        onApplySteps={handleApplyBrainDumpSteps}
      />

      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        projects={projects}
        currentProjectId={currentProject.id}
        onSelectProject={(id) => setActiveProjectId(id)}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        project={currentProject}
        onImportProject={handleImportProject}
      />

    </div>
  );
}
