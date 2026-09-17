import React, { useEffect, useState, useCallback } from 'react';
import { Search, MessageSquare, Mail, Globe, Phone, Trash2, ExternalLink, MapPin, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { leadsAPI, outreachAPI } from '@/lib/api';
import { getStatusBadgeColor, truncate, formatPhoneNumber, getDomain } from '@/lib/utils';

const TEMPLATE_KEY = 'leadflow_whatsapp_template';
const DEFAULT_TEMPLATE = 'Hi there! I came across your business and would love to explore how we can help. Is this a good time to connect?';

interface Lead {
  id: number; business_name: string; category: string; location: string; city: string; country: string;
  website: string; phone: string; email: string; whatsapp: string; status: string; created_at: string;
}
interface LeadsResponse { items: Lead[]; total: number; skip: number; limit: number; }

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [templateReady, setTemplateReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(TEMPLATE_KEY);
    if (saved) setMessageTemplate(saved);
    setTemplateReady(true);
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leadsAPI.list(page * limit, limit, {
        search: search || undefined, status: status || undefined, country: country || undefined,
        sort_by: 'created_at', sort_order: 'desc',
      });
      const data: LeadsResponse = response.data;
      setLeads(data.items); setTotal(data.total); setError(null);
    } catch (err) {
      setError('We could not load your leads. Check that the API is running and try again.');
      console.error(err);
    } finally { setLoading(false); }
  }, [page, limit, search, status, country]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await leadsAPI.delete(id);
      setLeads((current) => current.filter((lead) => lead.id !== id));
      setTotal((current) => Math.max(0, current - 1));
    } catch { alert('Failed to delete lead'); }
  };

  const openWhatsApp = async (lead: Lead) => {
    const number = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
    if (!number) { alert('This lead does not have a WhatsApp phone number.'); return; }
    const message = messageTemplate.trim() || DEFAULT_TEMPLATE;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    try {
      await outreachAPI.logWhatsApp(lead.id, message);
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: 'contacted' } : item));
    } catch (err) { console.error('Could not log WhatsApp outreach', err); }
  };

  const totalPages = Math.ceil(total / limit);
  const whatsappReady = leads.filter((lead) => lead.whatsapp || lead.phone).length;

  return (
    <div className="space-y-7">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div><p className="text-sm font-semibold text-emerald-600 mb-2">Relationship pipeline</p><h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Your leads</h1><p className="text-slate-500 mt-2">A clean view of the businesses you can reach next.</p></div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total leads</p><p className="text-2xl font-bold mt-2">{total}</p><p className="text-xs text-slate-400 mt-1">in your workspace</p></div>
        <div className="card p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">On this page</p><p className="text-2xl font-bold mt-2">{leads.length}</p><p className="text-xs text-slate-400 mt-1">visible results</p></div>
        <div className="card p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reachable</p><p className="text-2xl font-bold mt-2">{whatsappReady}</p><p className="text-xs text-slate-400 mt-1">WhatsApp or phone</p></div>
        <a href="/templates" className="card p-4 sm:p-5 hover:border-emerald-300 transition-colors group"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Message template</p><p className="text-sm font-semibold mt-3 group-hover:text-emerald-700">Edit universal copy <ArrowUpRight size={15} className="inline ml-1" /></p><p className="text-xs text-slate-400 mt-1">used by every send button</p></a>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-3 text-slate-400" size={18} /><input type="text" placeholder="Search by business, city, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="input w-full pl-10" /></div>
          <div className="flex gap-3"><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="input min-w-[140px]"><option value="">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select><input type="text" placeholder="Country" value={country} onChange={(e) => { setCountry(e.target.value); setPage(0); }} className="input w-28 sm:w-36" /><button className="btn btn-secondary px-3" aria-label="Filter leads"><SlidersHorizontal size={17} /></button></div>
        </div>
        {templateReady && <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3"><div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><MessageSquare size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Universal WhatsApp message</p><p className="text-xs text-slate-400 truncate">{messageTemplate || 'No message set yet'}</p></div><a href="/templates" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap">Edit template</a></div>}
      </section>

      {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>}

      <section className="card overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Lead directory</h2><p className="text-sm text-slate-400 mt-1">Open WhatsApp with your saved message in one click.</p></div><span className="text-xs font-semibold text-slate-400">{total ? `${page * limit + 1}–${Math.min((page + 1) * limit, total)} of ${total}` : '0 results'}</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead><tr className="table-head border-b border-slate-100"><th className="px-5 sm:px-6 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold">Business</th><th className="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold">Location</th><th className="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold">Contact</th><th className="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-bold">Status</th><th className="px-5 sm:px-6 py-3.5 text-right text-[11px] uppercase tracking-wider font-bold">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400"><div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />Loading leads…</td></tr> : leads.length === 0 ? <tr><td colSpan={5} className="px-6 py-16 text-center"><p className="font-semibold text-slate-700">No leads found</p><p className="text-sm text-slate-400 mt-1">Try changing your filters or import a new list.</p></td></tr> : leads.map((lead) => {
                const number = lead.whatsapp || lead.phone;
                const label = (lead.status || 'new').replace('_', ' ');
                return <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 sm:px-6 py-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">{(lead.business_name || '?').charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="font-semibold text-sm text-slate-900 truncate max-w-[220px]">{truncate(lead.business_name, 32)}</p>{lead.category && <p className="text-xs text-slate-400 mt-0.5">{lead.category}</p>}{lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-emerald-700 inline-flex items-center gap-1 mt-1">{getDomain(lead.website)} <ExternalLink size={10} /></a>}</div></div></td>
                  <td className="px-5 py-4"><div className="flex items-start gap-2 text-sm text-slate-600"><MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" /><span>{lead.city || lead.location || 'Unknown'}{lead.country && <span className="block text-xs text-slate-400 mt-0.5">{lead.country}</span>}</span></div></td>
                  <td className="px-5 py-4"><div className="space-y-1.5 text-xs text-slate-500">{lead.whatsapp && <p className="flex items-center gap-2"><MessageSquare size={13} className="text-emerald-600" />{formatPhoneNumber(lead.whatsapp)}</p>}{lead.phone && !lead.whatsapp && <p className="flex items-center gap-2"><Phone size={13} />{formatPhoneNumber(lead.phone)}</p>}{lead.email && <p className="flex items-center gap-2"><Mail size={13} />{truncate(lead.email, 27)}</p>}{!number && <span className="text-slate-400">No contact number</span>}</div></td>
                  <td className="px-5 py-4"><span className={`badge ${getStatusBadgeColor(lead.status)}`}>{label.charAt(0).toUpperCase() + label.slice(1)}</span></td>
                  <td className="px-5 sm:px-6 py-4 text-right"><div className="flex justify-end items-center gap-2"><button onClick={() => openWhatsApp(lead)} disabled={!number} className="btn btn-success px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"><MessageSquare size={15} /><span className="hidden sm:inline">WhatsApp</span></button><button onClick={() => handleDelete(lead.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete lead"><Trash2 size={16} /></button></div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {total > 0 && <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between"><p className="text-sm text-slate-400">Page {page + 1} of {totalPages}</p><div className="flex gap-2"><button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn btn-secondary py-2 disabled:opacity-40">Previous</button><button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn btn-secondary py-2 disabled:opacity-40">Next</button></div></div>}
      </section>
    </div>
  );
}
