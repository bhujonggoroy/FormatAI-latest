import React, { useState } from 'react';
import { AIProvider, AIModelOption } from '../types/ai.ts';
import { apiClient } from '../services/api.ts';
import { Cpu, Wand2, Sparkles, ChevronDown, Check, Loader2 } from 'lucide-react';

interface AIProviderSettingsProps {
  onInsertGeneratedText: (generatedText: string) => void;
  rawText: string;
  onError: (errorMsg: string) => void;
  disabled?: boolean;
}

const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    contextWindow: '1M tokens',
    recommendedTask: 'Fast Academic Formatting & Math Normalization',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    contextWindow: '2M tokens',
    recommendedTask: 'Deep Scholarly Rewriting & Monograph Synthesis',
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    contextWindow: '128K tokens',
    recommendedTask: 'General Academic Grammar & Reference Checks',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    contextWindow: '200K tokens',
    recommendedTask: 'Nuanced Humanities Prose & Complex Tables',
  },
];

export const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({
  onInsertGeneratedText,
  rawText,
  onError,
  disabled = false,
}) => {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [lastActionSuccess, setLastActionSuccess] = useState<string | null>(null);

  const filteredModels = AVAILABLE_MODELS.filter((m) => m.provider === provider);

  const handleRunAiAssistant = async (actionType: 'abstract' | 'references' | 'math' | 'custom') => {
    if (disabled || isGenerating) return;

    let instruction = '';
    let promptContent = '';

    if (actionType === 'abstract') {
      if (!rawText.trim()) {
        onError('Please paste your academic document text first to generate an abstract.');
        return;
      }
      instruction =
        'You are an expert academic editor. Generate a concise, formal academic abstract (150-250 words) summarizing the background, methodology, results, and conclusion of the provided content.';
      promptContent = `Document text:\n\n${rawText.slice(0, 8000)}`;
    } else if (actionType === 'references') {
      if (!rawText.trim()) {
        onError('Please paste document content with citations to standardize references.');
        return;
      }
      instruction =
        'You are an academic citation specialist. Extract and format all bibliographic citations into standardized APA 7th edition references.';
      promptContent = `Document text:\n\n${rawText.slice(0, 8000)}`;
    } else if (actionType === 'math') {
      if (!rawText.trim()) {
        onError('Please paste text containing equations to normalize into standard LaTeX.');
        return;
      }
      instruction =
        'Normalize all mathematical formulas and expressions in the text into clean LaTeX delimiters ($...$ for inline, $$...$$ for display). Keep all other prose intact.';
      promptContent = `Document text:\n\n${rawText.slice(0, 8000)}`;
    } else {
      if (!customPrompt.trim()) {
        onError('Please enter an instruction or prompt for the AI assistant.');
        return;
      }
      instruction =
        'You are an expert academic editor and typesetter. Assist the author with scholarly formatting and drafting.';
      promptContent = `${customPrompt}\n\nContext document text:\n${rawText.slice(0, 8000)}`;
    }

    setIsGenerating(true);
    setLastActionSuccess(null);

    try {
      const response = await apiClient.generateAI({
        provider,
        model: selectedModel,
        prompt: promptContent,
        system_instruction: instruction,
        temperature,
      });

      if (response && response.content) {
        onInsertGeneratedText(response.content);
        setLastActionSuccess(`Generated via ${response.model}`);
        if (actionType === 'custom') setCustomPrompt('');
      } else {
        onError('AI provider returned empty response.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI generation request failed';
      onError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">AI Provider & Model Settings</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition cursor-pointer"
        >
          <span>{isOpen ? 'Hide Settings' : 'Configure Provider'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Provider Configuration */}
      {isOpen && (
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Provider Selector */}
            <div>
              <label
                htmlFor="ai-provider-select"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5"
              >
                Provider
              </label>
              <select
                id="ai-provider-select"
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as AIProvider;
                  setProvider(p);
                  const first = AVAILABLE_MODELS.find((m) => m.provider === p);
                  if (first) setSelectedModel(first.id);
                }}
                disabled={disabled || isGenerating}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>

            {/* Model Selector */}
            <div>
              <label
                htmlFor="ai-model-select"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5"
              >
                Model
              </label>
              <select
                id="ai-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={disabled || isGenerating}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.contextWindow})
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="ai-temperature-slider"
                  className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Temperature
                </label>
                <span className="text-xs font-mono text-indigo-400">{temperature.toFixed(2)}</span>
              </div>
              <input
                id="ai-temperature-slider"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                disabled={disabled || isGenerating}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Lower = exact scholarly rigor, higher = descriptive prose.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Academic Enhancement Triggers */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Scholarly Assistant Actions
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleRunAiAssistant('abstract')}
            disabled={disabled || isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate Abstract</span>
          </button>

          <button
            type="button"
            onClick={() => handleRunAiAssistant('references')}
            disabled={disabled || isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Standardize APA References</span>
          </button>

          <button
            type="button"
            onClick={() => handleRunAiAssistant('math')}
            disabled={disabled || isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Format Math Notation ($)</span>
          </button>

          {isGenerating && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Querying AI Engine...</span>
            </div>
          )}

          {lastActionSuccess && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>{lastActionSuccess}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
