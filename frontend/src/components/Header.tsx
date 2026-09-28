import React from 'react';
import { HealthCheckResponse } from '../services/api.ts';
import { RefreshCw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { ACADEMIC_SAMPLES } from '../utils/samples.ts';

interface HeaderProps {
  health: HealthCheckResponse | null;
  isConnecting: boolean;
  onRefreshHealth: () => void;
  onSelectSample: (sampleId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  isConnecting,
  onRefreshHealth,
  onSelectSample,
}) => {
  const isHealthy = health?.status === 'ok';

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <a href="/" className="text-xl font-bold tracking-tight text-white hover:text-slate-200 transition">
              FormatAI
            </a>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-400 gap-2 pl-4 border-l border-slate-800">
            <span>FastAPI Academic Engine</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Python docx & PDF Pipeline</span>
          </div>
        </div>

        {/* Zone 2: Academic Sample Presets */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load Template:</span>
          <div className="flex items-center gap-1.5">
            {ACADEMIC_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample.id)}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer whitespace-nowrap"
                title={sample.description}
              >
                {sample.preset === 'research_paper'
                  ? 'IEEE Paper'
                  : sample.preset === 'exam'
                  ? 'Midterm Exam'
                  : 'APA Manuscript'}
              </button>
            ))}
          </div>
        </div>

        {/* Zone 3: Live Backend Health Status & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            {isConnecting ? (
              <div className="flex items-center gap-1.5 text-amber-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="font-mono">Connecting...</span>
              </div>
            ) : isHealthy ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-medium text-slate-300">FastAPI</span>
                <span className="font-mono text-emerald-400 text-[11px]">8001: Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-medium text-slate-300">Backend</span>
                <span className="font-mono text-rose-400 text-[11px]">Offline</span>
              </div>
            )}

            <button
              onClick={onRefreshHealth}
              disabled={isConnecting}
              className="ml-1 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition disabled:opacity-40 cursor-pointer"
              title="Refresh FastAPI Backend Health"
              aria-label="Refresh Backend Status"
            >
              <RefreshCw className={`w-3 h-3 ${isConnecting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
