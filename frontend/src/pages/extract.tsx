import React, { useState } from 'react';
import { Search, Zap, Clock } from 'lucide-react';
import { extractionAPI } from '@/lib/api';

interface ExtractFilters {
  country?: string;
  city?: string;
  industry?: string;
  keywords?: string;
  lead_count: number;
  needs_website: boolean;
  needs_email: boolean;
  needs_phone: boolean;
  needs_whatsapp: boolean;
}

export default function ExtractPage() {
  const [filters, setFilters] = useState<ExtractFilters>({
    country: '',
    city: '',
    industry: '',
    keywords: '',
    lead_count: 100,
    needs_website: false,
    needs_email: false,
    needs_phone: false,
    needs_whatsapp: false,
  });

  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await extractionAPI.start(filters);
      setJobId(response.data.job_id);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start extraction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      country: '',
      city: '',
      industry: '',
      keywords: '',
      lead_count: 100,
      needs_website: false,
      needs_email: false,
      needs_phone: false,
      needs_whatsapp: false,
    });
    setJobId(null);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Extract Leads</h1>
        <p className="text-gray-600 mt-2">
          Run a query using your Chrome extension
        </p>
      </div>

      {/* Phase Info */}
      <div className="card border-l-4 border-yellow-600 bg-yellow-50">
        <div className="flex gap-4">
          <Zap className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Keep your extension open</h3>
            <p className="text-yellow-800 text-sm">
              Set your query here, then keep the Chrome extension open. Matching results will be transferred to this workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Location Filters */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 mb-4">Location</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={filters.country}
                  onChange={handleChange}
                  placeholder="e.g., India, United States"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Region (Optional)
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, London"
                  className="input w-full"
                />
              </div>
            </div>
          </fieldset>

          {/* Business Filters */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 mb-4">Business</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry/Category *
                </label>
                <input
                  type="text"
                  name="industry"
                  value={filters.industry}
                  onChange={handleChange}
                  placeholder="e.g., IT, Real Estate, Healthcare"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={filters.keywords}
                  onChange={handleChange}
                  placeholder="e.g., startup, agency"
                  className="input w-full"
                />
              </div>
            </div>
          </fieldset>

          {/* Lead Count */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 mb-4">Extraction</legend>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Lead Count
              </label>
              <input
                type="number"
                name="lead_count"
                value={filters.lead_count}
                onChange={handleChange}
                min="10"
                max="50000"
                className="input w-full"
              />
              <p className="text-xs text-gray-600 mt-1">
                Between 10 and 50,000 leads
              </p>
            </div>
          </fieldset>

          {/* Contact Info Requirements */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-900 mb-4">
              Required Contact Info (Optional)
            </legend>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="needs_website"
                  checked={filters.needs_website}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">Has Website</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="needs_email"
                  checked={filters.needs_email}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">Has Email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="needs_phone"
                  checked={filters.needs_phone}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">Has Phone</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="needs_whatsapp"
                  checked={filters.needs_whatsapp}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">Has WhatsApp</span>
              </label>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading || !filters.country || !filters.industry}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Queue Extraction Job'}
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </form>
      ) : (
        // Success State
        <div className="card space-y-6">
          <div className="text-center py-6">
            <Clock className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Extraction Job Queued</h3>
            <p className="text-gray-600 mb-4">
              Job ID: <span className="font-mono font-bold">{jobId}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Your query has been queued. Keep the Chrome extension open so matching results can flow into your lead queue.
            </p>

            {/* Filter Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-3">Extraction Parameters</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {filters.country && (
                  <>
                    <dt className="font-medium text-gray-700">Country:</dt>
                    <dd className="text-gray-600">{filters.country}</dd>
                  </>
                )}
                {filters.city && (
                  <>
                    <dt className="font-medium text-gray-700">City:</dt>
                    <dd className="text-gray-600">{filters.city}</dd>
                  </>
                )}
                {filters.industry && (
                  <>
                    <dt className="font-medium text-gray-700">Industry:</dt>
                    <dd className="text-gray-600">{filters.industry}</dd>
                  </>
                )}
                {filters.keywords && (
                  <>
                    <dt className="font-medium text-gray-700">Keywords:</dt>
                    <dd className="text-gray-600">{filters.keywords}</dd>
                  </>
                )}
                <dt className="font-medium text-gray-700">Lead Count:</dt>
                <dd className="text-gray-600">{filters.lead_count}</dd>
                <dt className="font-medium text-gray-700">Contact Requirements:</dt>
                <dd className="text-gray-600">
                  {[
                    filters.needs_website && 'Website',
                    filters.needs_email && 'Email',
                    filters.needs_phone && 'Phone',
                    filters.needs_whatsapp && 'WhatsApp',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Any'}
                </dd>
              </dl>
            </div>
          </div>

          {/* Phase 2 Next Steps */}
          <div className="card bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Phase 2: What's Next?</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Chrome extension will parse pages matching your criteria</li>
              <li>Extracted leads auto-import with duplicate detection</li>
              <li>Real-time job status and progress tracking</li>
              <li>Automatic data normalization and enrichment</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="btn btn-primary"
            >
              Queue Another Extraction
            </button>
            <a href="/leads" className="btn btn-secondary">
              View Leads
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
