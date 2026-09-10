import React, { useEffect, useState, useCallback } from 'react';
import { Search, MessageSquare, Mail, Globe, Phone, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { leadsAPI, outreachAPI } from '@/lib/api';
import { formatDate, getStatusBadgeColor, truncate, formatPhoneNumber, getDomain } from '@/lib/utils';

interface Lead {
  id: number;
  business_name: string;
  category: string;
  location: string;
  city: string;
  country: string;
  website: string;
  phone: string;
  email: string;
  whatsapp: string;
  outreach_message: string;
  status: string;
  has_website: boolean;
  has_email: boolean;
  has_phone: boolean;
  has_whatsapp: boolean;
  created_at: string;
  updated_at: string;
}

interface LeadsResponse {
  items: Lead[];
  total: number;
  skip: number;
  limit: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [messageTemplate, setMessageTemplate] = useState(
    'Hello! I found your business online and would like to connect. Is this a good time to chat?'
  );
  const [messageByLead, setMessageByLead] = useState<Record<number, string>>({});

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leadsAPI.list(page * limit, limit, {
        search: search || undefined,
        status: status || undefined,
        country: country || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const data: LeadsResponse = response.data;
      setLeads(data.items);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, country, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(id);
        setLeads(leads.filter((l) => l.id !== id));
      } catch (err) {
        alert('Failed to delete lead');
      }
    }
  };

  const openWhatsApp = async (lead: Lead) => {
    const number = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
    const message = messageByLead[lead.id] ?? messageTemplate;
    if (!number) {
      alert('This lead does not have a WhatsApp phone number.');
      return;
    }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    try {
      await outreachAPI.logWhatsApp(lead.id, message);
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: 'contacted' } : item));
    } catch (err) {
      console.error('Could not log WhatsApp outreach', err);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = page + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and filter your leads</p>
        </div>
        <a href="/import" className="btn btn-primary">
          + Import Leads
        </a>
      </div>

      {/* Filters */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp message template
        </label>
        <textarea
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          rows={3}
          className="input w-full mb-4"
          placeholder="Type the message you want to send..."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Business name, email, phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="input w-full"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              placeholder="e.g., India"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(0);
              }}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-head border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold">Business</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Contact Info</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No leads found. <a href="/import" className="text-blue-600 hover:underline">Import some leads</a>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{truncate(lead.business_name, 30)}</p>
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            {getDomain(lead.website)}
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.category || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{lead.city}</div>
                      {lead.country && <div className="text-xs text-gray-500">{lead.country}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <textarea
                          value={messageByLead[lead.id] ?? messageTemplate}
                          onChange={(e) => setMessageByLead({ ...messageByLead, [lead.id]: e.target.value })}
                          rows={2}
                          className="input w-56 text-xs"
                          aria-label={`Message for ${lead.business_name}`}
                        />
                        <div className="flex gap-2">
                        {lead.whatsapp && (
                          <button onClick={() => openWhatsApp(lead)} className="btn btn-success text-xs" title={`Open WhatsApp for ${formatPhoneNumber(lead.whatsapp)}`}>
                            <MessageSquare size={16} />
                            <span className="ml-1">Send</span>
                          </button>
                        )}
                        {lead.email && (
                          <button
                            className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            title={`Email: ${lead.email}`}
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {lead.phone && (
                          <button
                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            title={`Phone: ${formatPhoneNumber(lead.phone)}`}
                          >
                            <Phone size={16} />
                          </button>
                        )}
                        {lead.website && (
                          <button
                            className="p-1.5 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                            title="Has Website"
                          >
                            <Globe size={16} />
                          </button>
                        )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadgeColor(lead.status)}`}>
                        {lead.status.replace('_', ' ').charAt(0).toUpperCase() + lead.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = page > 2 ? page - 2 + i : i;
                  if (pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
