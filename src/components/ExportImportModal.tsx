import React, { useState } from 'react';
import { WorkflowProject } from '../types';
import { generateMarkdownExport } from '../utils/workflowHelpers';
import {
  X,
  Copy,
  Download,
  Upload,
  Check,
  FileText,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorkflowProject;
  onImportProject: (imported: WorkflowProject) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  project,
  onImportProject,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'markdown' | 'json' | 'import'>('markdown');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const markdownContent = generateMarkdownExport(project);
  const jsonContent = JSON.stringify(project, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError(null);
    try {
      if (!jsonInput.trim()) {
        throw new Error('Please paste valid JSON data.');
      }
      const parsed = JSON.parse(jsonInput);
      if (!parsed.title || !Array.isArray(parsed.steps)) {
        throw new Error('Invalid format: project must contain a "title" and a "steps" array.');
      }

      const importedProject: WorkflowProject = {
        ...parsed,
        id: `imported-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };

      onImportProject(importedProject);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Export & Import Workflow
              </h3>
              <p className="text-xs text-slate-700 dark:text-zinc-300">
                Share your register as Markdown logs, download JSON backups, or load saved workflows.
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

        {/* Tab Controls */}
        <div className="px-5 pt-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'markdown'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Log</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 flex-1 space-y-4">
          
          {activeTab === 'markdown' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Ready to paste into GitHub README, Obsidian, Notion, or project documents.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(markdownContent)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-semibold rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadFile(
                        markdownContent,
                        `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workflow.md`,
                        'text/markdown'
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                rows={12}
                value={markdownContent}
                className="w-full font-mono text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Complete structured project data for backup and portability.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(jsonContent)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-semibold rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadFile(
                        jsonContent,
                        `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`,
                        'application/json'
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                rows={12}
                value={jsonContent}
                className="w-full font-mono text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Paste JSON workflow data below to create a new project in your Chaotic Classifier workspace:
              </p>
              <textarea
                rows={10}
                placeholder="Paste JSON project export here..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full font-mono text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {importError && (
                <div className="text-xs text-rose-600 font-medium">
                  {importError}
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!jsonInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Workflow Project</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
