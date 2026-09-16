'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BarChart3, Users, Search, Menu, X, MessageSquareText, Upload, ArrowRight } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navItems = [
    { name: 'Overview', path: '/', icon: BarChart3 },
    { name: 'Find leads', path: '/extract', icon: Search },
    { name: 'Lead queue', path: '/leads', icon: Users },
    { name: 'Message template', path: '/templates', icon: MessageSquareText },
  ];
  const pageTitle = router.pathname === '/extract' ? 'Find leads' : router.pathname === '/leads' ? 'Lead queue' : router.pathname === '/templates' ? 'Message template' : 'Overview';

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[76px]'} hidden md:flex bg-slate-950 text-white transition-[width] duration-300 flex-col shrink-0`}>
        <div className="h-20 px-5 flex items-center border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0"><div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-sm">L</div>{sidebarOpen && <div className="min-w-0"><p className="font-semibold tracking-tight">Leadflow</p><p className="text-[11px] text-slate-400">Collect · Review · Reach</p></div>}</div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" aria-label="Toggle sidebar">{sidebarOpen ? <X size={17} /> : <Menu size={17} />}</button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">{navItems.map((item) => { const Icon = item.icon; const isActive = router.pathname === item.path; return <Link key={item.path} href={item.path}><span className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${isActive ? 'bg-white text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}><Icon size={18} />{sidebarOpen && <span>{item.name}</span>}</span></Link>; })}</nav>
        {sidebarOpen && <div className="m-3 p-4 rounded-2xl bg-emerald-400 text-slate-950"><p className="text-xs font-bold uppercase tracking-wider">The workflow</p><p className="text-sm mt-2 leading-5">Find businesses, review contacts, start conversations.</p><Link href="/extract" className="inline-flex items-center gap-1.5 text-xs font-bold mt-4">Start a query <ArrowRight size={13} /></Link></div>}
        <div className="px-5 py-4 border-t border-white/10 text-xs text-slate-500">{sidebarOpen && <p>Leadflow v2.0</p>}</div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100" aria-label="Open navigation"><Menu size={20} /></button><div><p className="text-xs font-medium text-slate-400 uppercase tracking-[0.18em]">Leadflow</p><h2 className="text-sm sm:text-base font-semibold text-slate-800">{pageTitle}</h2></div></div>
          <div className="flex items-center gap-3"><Link href="/import" className="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><Upload size={16} /> Import file</Link><Link href="/extract" className="btn btn-primary py-2"><Search size={15} /> <span className="hidden sm:inline">Find leads</span></Link></div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-8"><div className="max-w-[1440px] mx-auto">{children}</div></main>
      </div>
    </div>
  );
}
