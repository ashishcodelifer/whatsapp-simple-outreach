import React, { useMemo, useState } from 'react';
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

type TextFilter = 'country' | 'city' | 'industry' | 'keywords';

const defaultFilters: ExtractFilters = {
  country: '',
  city: '',
  industry: '',
  keywords: '',
  lead_count: 100,
  needs_website: false,
  needs_email: false,
  needs_phone: false,
  needs_whatsapp: false,
};

const countrySuggestions = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'UAE'];

const citySuggestions: Record<string, string[]> = {
  India: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Patna'],
  'United States': ['New York', 'Los Angeles', 'Austin', 'Miami', 'Chicago', 'San Francisco'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Glasgow'],
  Canada: ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa', 'Mississauga'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
  UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah'],
};

const fallbackCities = ['Mumbai', 'Delhi', 'Dubai', 'London', 'Toronto', 'New York'];

const industrySuggestions = [
  'Restaurants',
  'Real Estate',
  'Dental Clinics',
  'Car Rentals',
  'Salons',
  'Gyms',
  'Travel Agencies',
  'Coaching Institutes',
  'Digital Agencies',
  'Local Contractors',
];

const keywordSuggestions = [
  'open now',
  'owner operated',
  'high rating',
  'verified phone',
  'accepts whatsapp',
  'new business',
  'near me',
  'service provider',
];

const smartPacks = [
  {
    title: 'Local service push',
    country: 'India',
    city: 'Mumbai',
    industry: 'Salons',
    keywords: 'high rating, accepts whatsapp',
    note: 'Good for WhatsApp-first local offers.',
  },
  {
    title: 'Property partners',
    country: 'UAE',
    city: 'Dubai',
    industry: 'Real Estate',
    keywords: 'verified phone, agency',
    note: 'Targets teams that usually respond fast by phone.',
  },
  {
    title: 'Healthcare outreach',
    country: 'United States',
    city: 'Austin',
    industry: 'Dental Clinics',
    keywords: 'owner operated, website',
    note: 'Better for high-intent service businesses.',
  },
];

export default function ExtractPage() {
  const [filters, setFilters] = useState<ExtractFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const suggestedCities = useMemo(() => {
    return citySuggestions[filters.country || ''] || fallbackCities;
  }, [filters.country]);

  const queryTitle = useMemo(() => {
    const business = filters.industry || 'businesses';
    const place = [filters.city, filters.country].filter(Boolean).join(', ') || 'your target market';
    return `${business} in ${place}`;
  }, [filters.city, filters.country, filters.industry]);

  const selectedRequirements = useMemo(() => {
    return [
      filters.needs_website && 'website',
      filters.needs_email && 'email',
      filters.needs_phone && 'phone',
      filters.needs_whatsapp && 'WhatsApp',
    ].filter(Boolean) as string[];
  }, [filters.needs_email, filters.needs_phone, filters.needs_website, filters.needs_whatsapp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const setTextFilter = (name: TextFilter, value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const addKeyword = (keyword: string) => {
    setFilters((current) => {
      const existing = (current.keywords || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (existing.map((item) => item.toLowerCase()).includes(keyword.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        keywords: [...existing, keyword].join(', '),
      };
    });
  };

  const applySmartPack = (pack: (typeof smartPacks)[number]) => {
    setFilters((current) => ({
      ...current,
      country: pack.country,
      city: pack.city,
      industry: pack.industry,
      keywords: pack.keywords,
      needs_phone: true,
      needs_whatsapp: true,
    }));
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
    setFilters(defaultFilters);
    setJobId(null);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Query intelligence</p>
          <h1 className="text-3xl font-bold text-gray-900">Find Leads</h1>
          <p className="text-gray-600 mt-2">
            Build a sharper Google Maps query for the Chrome extension.
          </p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Current query</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{queryTitle}</p>
        </div>
      </div>

      <div className="card border-l-4 border-yellow-600 bg-yellow-50 p-5">
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

      {!submitted ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="card p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <fieldset>
              <legend className="text-lg font-semibold text-gray-900 mb-4">Location</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmartInput
                  label="Country *"
                  name="country"
                  value={filters.country || ''}
                  placeholder="e.g., India, United States"
                  suggestions={countrySuggestions}
                  onChange={handleChange}
                  onPick={(value) => setTextFilter('country', value)}
                />
                <SmartInput
                  label="City/Region"
                  name="city"
                  value={filters.city || ''}
                  placeholder="e.g., Mumbai, London"
                  suggestions={suggestedCities}
                  onChange={handleChange}
                  onPick={(value) => setTextFilter('city', value)}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-900 mb-4">Business</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmartInput
                  label="Industry/Category *"
                  name="industry"
                  value={filters.industry || ''}
                  placeholder="e.g., Real Estate, Healthcare"
                  suggestions={industrySuggestions}
                  onChange={handleChange}
                  onPick={(value) => setTextFilter('industry', value)}
                />
                <SmartInput
                  label="Keywords"
                  name="keywords"
                  value={filters.keywords || ''}
                  placeholder="e.g., startup, agency"
                  suggestions={keywordSuggestions}
                  onChange={handleChange}
                  onPick={addKeyword}
                />
              </div>
            </fieldset>

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
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                  {[100, 500, 1000].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => setFilters((current) => ({ ...current, lead_count: count }))}
                      className={`rounded-xl border px-3 py-2 transition ${
                        filters.lead_count === count
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-gray-50 hover:border-emerald-300'
                      }`}
                    >
                      {count.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-gray-900 mb-4">
                Required Contact Info
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RequirementToggle name="needs_website" label="Has Website" checked={filters.needs_website} onChange={handleChange} />
                <RequirementToggle name="needs_email" label="Has Email" checked={filters.needs_email} onChange={handleChange} />
                <RequirementToggle name="needs_phone" label="Has Phone" checked={filters.needs_phone} onChange={handleChange} />
                <RequirementToggle name="needs_whatsapp" label="Has WhatsApp" checked={filters.needs_whatsapp} onChange={handleChange} />
              </div>
            </fieldset>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <button
                type="submit"
                disabled={loading || !filters.country || !filters.industry}
                className="btn btn-primary disabled:opacity-50"
              >
                <Search size={16} />
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
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Smart query packs</p>
              <div className="mt-4 space-y-3">
                {smartPacks.map((pack) => (
                  <button
                    type="button"
                    key={pack.title}
                    onClick={() => applySmartPack(pack)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <span className="block text-sm font-semibold text-gray-900">{pack.title}</span>
                    <span className="mt-1 block text-xs text-gray-600">{pack.industry} in {pack.city}</span>
                    <span className="mt-3 block text-xs text-gray-500">{pack.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Lead context</p>
              <div className="mt-4 space-y-4 text-sm">
                <ContextRow label="Query" value={queryTitle} />
                <ContextRow label="Volume" value={`${filters.lead_count.toLocaleString()} target leads`} />
                <ContextRow
                  label="Priority data"
                  value={selectedRequirements.length ? selectedRequirements.join(', ') : 'Any available contact signal'}
                />
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-sm font-semibold text-emerald-700">Suggestion</p>
                  <p className="text-xs text-gray-700 mt-2 leading-5">
                    Use one city with one category first. Add keywords only when the list is too broad or low quality.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      ) : (
        <div className="card p-6 space-y-6">
          <div className="text-center py-6">
            <Clock className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Extraction Job Queued</h3>
            <p className="text-gray-600 mb-4">
              Job ID: <span className="font-mono font-bold">{jobId}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Your query has been queued. Keep the Chrome extension open so matching results can flow into your lead queue.
            </p>

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

          <div className="card bg-blue-50 border border-blue-200 p-5">
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

function SmartInput({
  label,
  name,
  value,
  placeholder,
  suggestions,
  onChange,
  onPick,
}: {
  label: string;
  name: TextFilter;
  value: string;
  placeholder: string;
  suggestions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPick: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input w-full"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion}
            onClick={() => onPick(suggestion)}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function RequirementToggle({
  name,
  label,
  checked,
  onChange,
}: {
  name: keyof Pick<ExtractFilters, 'needs_website' | 'needs_email' | 'needs_phone' | 'needs_whatsapp'>;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer transition hover:border-emerald-300">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded"
      />
    </label>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
