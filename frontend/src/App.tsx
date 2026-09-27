import { useState, useEffect, useCallback } from 'react';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BackendHealth {
  status: string;
  service: string;
  backend: string;
}

export default function App() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkBackendStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First attempt relative URL (via Vite proxy /api/health)
      let res: Response;
      try {
        res = await fetch('/api/health');
      } catch {
        // Fallback directly to localhost:8001 if proxy not in chain
        res = await fetch('http://127.0.0.1:8001/api/health');
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: BackendHealth = await res.json();
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reach Python backend';
      setError(message);
      setHealth(null);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkBackendStatus();
  }, [checkBackendStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">FormatAI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                  v1.0.0-init
                </span>
              </div>
              <p className="text-xs text-slate-400">AI-Powered Academic Document Formatter</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                health?.status === 'ok'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : loading
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.status === 'ok'
                    ? 'bg-emerald-400 animate-pulse'
                    : loading
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-400'
                }`}
              />
              {loading ? 'Checking...' : health?.status === 'ok' ? 'FastAPI Online' : 'FastAPI Offline'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Project Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture Initialization Phase</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            FormatAI
          </h1>
          <p className="text-lg text-slate-400">
            Professional academic document formatting system powered by Python FastAPI & Vite React.
          </p>
        </div>

        {/* Status Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Python FastAPI Backend Information */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Python FastAPI Backend</h2>
                  <p className="text-xs text-slate-400">High-performance ASGI Core</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Port 8001
              </span>
            </div>

            <div className="space-y-3 mt-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400 text-xs">Framework</span>
                <span className="font-mono text-slate-200 text-xs">FastAPI + Uvicorn</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400 text-xs">Runtime Engine</span>
                <span className="font-mono text-slate-200 text-xs">Python 3.11</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400 text-xs">Validation</span>
                <span className="font-mono text-slate-200 text-xs">Pydantic v2</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 text-xs">Active Endpoints</span>
                <span className="font-mono text-xs text-indigo-400">/api/health &bull; /api/document/process &bull; /api/documents/docx</span>
              </div>
            </div>
          </div>

          {/* Card 2: Backend Status & Live Ping */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Backend Status</h2>
                  <p className="text-xs text-slate-400">Health Endpoint Communication</p>
                </div>
              </div>
              <button
                onClick={checkBackendStatus}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 transition disabled:opacity-50 cursor-pointer"
                title="Refresh backend status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Ping</span>
              </button>
            </div>

            {/* Health payload display */}
            <div className="mt-4">
              {loading && !health ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center py-6">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Connecting to FastAPI backend...</p>
                </div>
              ) : health ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Endpoint Responsive (/api/health)</span>
                  </div>
                  <pre className="bg-slate-950/80 p-3 rounded-lg text-xs font-mono text-emerald-300 border border-emerald-500/20 overflow-x-auto">
                    {JSON.stringify(health, null, 2)}
                  </pre>
                  {lastChecked && (
                    <p className="text-[11px] text-slate-400 text-right">
                      Last pinged at {lastChecked}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Unable to Connect to Backend</span>
                  </div>
                  <p className="text-xs text-rose-300/80">
                    {error || 'Make sure uvicorn is running on port 8001.'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded">
                    Run: uvicorn backend.main:app --port 8001
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Architecture Specs Box */}
        <div className="mt-10 max-w-4xl mx-auto rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-200 font-semibold text-sm">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>FormatAI Target Architecture</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-semibold text-slate-300 block mb-1">1. Frontend Layer</span>
              <p>React 19, TypeScript, Tailwind CSS, Vite client communicating with FastAPI.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-semibold text-slate-300 block mb-1">2. Python Backend</span>
              <p>FastAPI, Pydantic schemas, python-docx document synthesis engine.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="font-semibold text-slate-300 block mb-1">3. AI Provider Layer</span>
              <p>Provider-independent pipeline starting with Gemini, expandable to multiple models.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        FormatAI &copy; {new Date().getFullYear()} &bull; Architecture Initialization Complete
      </footer>
    </div>
  );
}
