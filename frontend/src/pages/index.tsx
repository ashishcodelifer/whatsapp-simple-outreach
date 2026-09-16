import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Chrome, MessageSquare, Search, Upload, Users, CheckCircle2 } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';

interface Metrics {
  total_leads: number;
  leads_whatsapp_ready: number;
  leads_contacted: number;
  recent_activity_count: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardAPI.metrics()
      .then((response) => setMetrics(response.data))
      .catch((err) => { setError('We could not load your pipeline summary.'); console.error(err); })
      .finally(() => setLoading(false));
  }, []);

  const total = metrics?.total_leads || 0;
  const reachable = metrics?.leads_whatsapp_ready || 0;
  const contacted = metrics?.leads_contacted || 0;
  const readyPercent = total ? Math.round((reachable / total) * 100) : 0;
  const contactedPercent = total ? Math.round((contacted / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-emerald-600 mb-2">Your outreach workspace</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Move leads forward.</h1>
          <p className="text-slate-500 mt-2 max-w-xl">Keep the extension open, collect the right businesses, then start personal conversations from one focused queue.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/import" className="btn btn-secondary"><Upload size={16} /> Import file</Link>
          <Link href="/extract" className="btn btn-primary"><Search size={16} /> Find leads <ArrowRight size={15} /></Link>
        </div>
      </section>

      {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>}

      <section className="grid md:grid-cols-3 gap-4">
        <Link href="/extract" className="card p-6 hover:border-emerald-300 transition-colors group">
          <div className="flex items-center justify-between"><span className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center"><Chrome size={19} /></span><ArrowRight size={17} className="text-slate-300 group-hover:text-emerald-600 transition-colors" /></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6">01 · Collect</p>
          <h2 className="font-semibold text-slate-950 mt-2">Run a query</h2>
          <p className="text-sm text-slate-500 mt-1 leading-5">Keep the Chrome extension open while it gathers matching businesses.</p>
        </Link>
        <Link href="/leads" className="card p-6 hover:border-emerald-300 transition-colors group">
          <div className="flex items-center justify-between"><span className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center"><Users size={19} /></span><ArrowRight size={17} className="text-slate-300 group-hover:text-emerald-600 transition-colors" /></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6">02 · Review</p>
          <h2 className="font-semibold text-slate-950 mt-2">Work your lead queue</h2>
          <p className="text-sm text-slate-500 mt-1 leading-5">Filter the businesses that arrived from the extension and check their contact details.</p>
        </Link>
        <Link href="/templates" className="card p-6 hover:border-emerald-300 transition-colors group">
          <div className="flex items-center justify-between"><span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><MessageSquare size={19} /></span><ArrowRight size={17} className="text-slate-300 group-hover:text-emerald-600 transition-colors" /></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6">03 · Outreach</p>
          <h2 className="font-semibold text-slate-950 mt-2">Start conversations</h2>
          <p className="text-sm text-slate-500 mt-1 leading-5">Set one message and open WhatsApp for each reachable contact.</p>
        </Link>
      </section>

      <section className="grid lg:grid-cols-[1.25fr_0.75fr] gap-4">
        <div className="card p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-950">Pipeline snapshot</h2><p className="text-sm text-slate-400 mt-1">Only the numbers that help you decide what to do next.</p></div><Link href="/leads" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Open leads</Link></div>
          {loading ? <div className="h-32 flex items-center justify-center text-sm text-slate-400">Loading summary…</div> : <div className="grid sm:grid-cols-3 gap-6 mt-8"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Collected</p><p className="text-3xl font-bold text-slate-950 mt-2">{total}</p><p className="text-xs text-slate-400 mt-1">total businesses</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reachable</p><p className="text-3xl font-bold text-slate-950 mt-2">{reachable}</p><div className="h-1.5 bg-slate-100 rounded-full mt-3"><div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${readyPercent}%` }} /></div><p className="text-xs text-slate-400 mt-2">{readyPercent}% have WhatsApp-ready contact info</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contacted</p><p className="text-3xl font-bold text-slate-950 mt-2">{contacted}</p><div className="h-1.5 bg-slate-100 rounded-full mt-3"><div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${contactedPercent}%` }} /></div><p className="text-xs text-slate-400 mt-2">{contactedPercent}% of your collected leads</p></div></div>}
        </div>

        <div className="card p-6 sm:p-7 bg-slate-950 text-white border-slate-950">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold"><CheckCircle2 size={16} /> Simple operating loop</div>
          <ol className="mt-6 space-y-5">{[['Keep extension open', 'Run the query and let results flow in.'], ['Review the queue', 'Remove noise and prioritize reachable contacts.'], ['Send personally', 'Use the shared template, then tailor when needed.']].map(([title, copy], index) => <li key={title} className="flex gap-3"><span className="h-6 w-6 rounded-full bg-white/10 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-slate-400 mt-1 leading-5">{copy}</p></div></li>)}</ol>
          <Link href="/extract" className="btn mt-7 w-full bg-white text-slate-950 hover:bg-emerald-50">Start next query <ArrowRight size={15} /></Link>
        </div>
      </section>

      <div className="flex items-center justify-between text-sm text-slate-400 px-1"><span>{metrics?.recent_activity_count || 0} recent activity items</span><Link href="/settings" className="hover:text-slate-700">Workspace settings</Link></div>
    </div>
  );
}
