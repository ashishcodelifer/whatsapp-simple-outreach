import React, { useEffect, useState } from 'react';
import { MessageSquare, Save, RotateCcw, CheckCircle2, Eye, Sparkles } from 'lucide-react';

const TEMPLATE_KEY = 'leadflow_whatsapp_template';
const DEFAULT_TEMPLATE = 'Hi there! I came across your business and would love to explore how we can help. Is this a good time to connect?';

export default function TemplatesPage() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const value = window.localStorage.getItem(TEMPLATE_KEY);
    if (value !== null) setTemplate(value);
  }, []);

  const saveTemplate = () => {
    window.localStorage.setItem(TEMPLATE_KEY, template);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const resetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    window.localStorage.setItem(TEMPLATE_KEY, DEFAULT_TEMPLATE);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <section>
        <p className="text-sm font-semibold text-emerald-600 mb-2">Outreach toolkit</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Message template</h1>
        <p className="text-slate-500 mt-2 max-w-2xl">Write once, use everywhere. Every WhatsApp button in your lead directory will open with this message pre-filled.</p>
      </section>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <section className="card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-7">
            <div className="flex items-start gap-3"><div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><MessageSquare size={19} /></div><div><h2 className="font-semibold text-slate-950">Universal WhatsApp copy</h2><p className="text-sm text-slate-400 mt-1">Keep it short, human, and easy to reply to.</p></div></div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1"><CheckCircle2 size={13} /> Active</span>
          </div>
          <label htmlFor="template" className="text-xs font-bold uppercase tracking-wider text-slate-400">Your message</label>
          <textarea id="template" value={template} onChange={(e) => { setTemplate(e.target.value); setSaved(false); }} rows={8} maxLength={1000} className="input w-full mt-2 resize-y leading-6" placeholder="Type your WhatsApp message..." />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400"><span>Tip: end with a simple question to invite a reply.</span><span>{template.length}/1000</span></div>
          <div className="flex flex-col sm:flex-row gap-3 mt-7"><button onClick={saveTemplate} className="btn btn-primary"><Save size={16} /> {saved ? 'Saved for all leads' : 'Save template'}</button><button onClick={resetTemplate} className="btn btn-secondary"><RotateCcw size={16} /> Restore default</button></div>
        </section>

        <section className="card p-6 sm:p-8 bg-slate-950 text-white border-slate-950">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold"><Eye size={16} /> Live preview</div>
          <p className="text-xs text-slate-400 mt-1">This is how your message will open in WhatsApp.</p>
          <div className="mt-8 rounded-2xl bg-[#d9fdd3] text-slate-800 p-4 shadow-sm relative"><div className="absolute -left-1.5 top-4 h-3 w-3 bg-[#d9fdd3] rotate-45" /><p className="text-sm leading-6 whitespace-pre-wrap">{template || 'Your message preview will appear here.'}</p><p className="text-[10px] text-slate-500 text-right mt-2">now ✓✓</p></div>
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4"><div className="flex gap-3"><Sparkles size={16} className="text-emerald-300 shrink-0 mt-0.5" /><p className="text-sm text-slate-300 leading-5">Your template is stored locally in this browser and applies instantly to every lead.</p></div><div className="flex gap-3"><MessageSquare size={16} className="text-emerald-300 shrink-0 mt-0.5" /><p className="text-sm text-slate-300 leading-5">The WhatsApp action uses a secure wa.me link with this copy URL-encoded.</p></div></div>
        </section>
      </div>

      <section className="card p-6 sm:p-8">
        <h2 className="font-semibold text-slate-950">A simple outreach formula</h2>
        <div className="grid sm:grid-cols-3 gap-5 mt-5"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">01 · Context</p><p className="text-sm text-slate-600 mt-2 leading-5">Say why you are reaching out so it feels relevant.</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">02 · Value</p><p className="text-sm text-slate-600 mt-2 leading-5">Share one clear outcome you can help with.</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">03 · Next step</p><p className="text-sm text-slate-600 mt-2 leading-5">Ask a low-pressure question that is easy to answer.</p></div></div>
      </section>
    </div>
  );
}
