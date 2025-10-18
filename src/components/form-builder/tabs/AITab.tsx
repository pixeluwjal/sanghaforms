'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
// Removed 'react-textarea-autosize' import due to build error.
// Using native <textarea> instead.

interface AITabProps {
  onAIGenerated: (formData: any) => void;
}

export default function AITab({ onAIGenerated }: AITabProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFormWithAI = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your form');
      return;
    }

    setIsGenerating(true);
    try {
      // NOTE: Assuming this API endpoint is configured correctly elsewhere
      const response = await fetch('/api/forms/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form');
      }

      if (data.form) {
        onAIGenerated(data.form);
        toast.success('Form generated successfully! Review and publish it.');
        setPrompt('');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Failed to generate form with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // Responsive container with dynamic background colors for visual depth
    <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)] bg-slate-50/70">
      <div className="w-full max-w-3xl space-y-8">

        {/* --- AI Hero Card (Stunning Visuals) --- */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 text-center shadow-2xl shadow-purple-400/50 transition-all duration-500 hover:shadow-3xl hover:shadow-purple-500/60">
          <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            Generate with Gemini AI
          </h1>
          <p className="text-indigo-100 text-lg font-medium max-w-xl mx-auto opacity-90">
            Describe the form you need in plain language, and our AI will instantly build the structure, sections, and fields for you.
          </p>
        </div>

        {/* --- Input & Action Card (Glass-morphic Style) --- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          
          <label className="block text-lg font-bold text-slate-800 mb-4">
            What kind of form do you need?
          </label>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a conference registration form. I need sections for attendee details, session selection (up to 3), and payment information. Make the email required."
            rows={5} // Using fixed rows now
            className="w-full px-5 py-4 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 text-base resize-y transition-all duration-300 shadow-inner hover:border-slate-400 placeholder:text-slate-400"
          />

          {/* --- AI Tips Block (Vibrant and Informative) --- */}
          <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-2xl p-5 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-xl text-amber-900 mb-2">Pro-Tips for Better Forms</h3>
                <ul className="text-amber-800 text-sm space-y-1 list-inside list-disc marker:text-amber-500">
                  <li>Be **specific** about the *sections* and *fields* you need.</li>
                  <li>Mention if you require **advanced fields** (e.g., file upload, signature).</li>
                  <li>Specify which fields should be **required** or have validation rules.</li>
                  <li>Include details about the **context** (e.g., "sangha hierarchy selection").</li>
                </ul>
              </div>
            </div>
          </div>

          {/* --- Generate Button (Prominent Call-to-Action) --- */}
          <button
            onClick={generateFormWithAI}
            disabled={isGenerating || !prompt.trim()}
            className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 rounded-xl font-bold text-xl uppercase tracking-wide hover:from-indigo-700 hover:to-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/70 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Form Structure...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Form with AI</span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
