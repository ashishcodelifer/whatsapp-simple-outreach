import React, { useEffect, useState } from 'react';
import { Users, Mail, Globe, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { dashboardAPI } from '@/lib/api';

interface Metrics {
  total_leads: number;
  leads_whatsapp_ready: number;
  leads_email_ready: number;
  leads_with_website: number;
  leads_contacted: number;
  recent_activity_count: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await dashboardAPI.metrics();
        setMetrics(response.data);
      } catch (err) {
        setError('Failed to load dashboard metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your lead generation pipeline</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Total Leads"
              value={metrics.total_leads}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="WhatsApp Ready"
              value={metrics.leads_whatsapp_ready}
              icon={MessageSquare}
              color="green"
            />
            <MetricCard
              title="Email Ready"
              value={metrics.leads_email_ready}
              icon={Mail}
              color="purple"
            />
            <MetricCard
              title="With Website"
              value={metrics.leads_with_website}
              icon={Globe}
              color="yellow"
            />
            <MetricCard
              title="Contacted"
              value={metrics.leads_contacted}
              icon={TrendingUp}
              color="red"
            />
            <MetricCard
              title="Recent Activity"
              value={metrics.recent_activity_count}
              icon={Activity}
              color="blue"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">New Leads</span>
                    <span className="font-medium text-gray-900">
                      {((metrics.total_leads - metrics.leads_contacted) / metrics.total_leads * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max(1, (metrics.total_leads - metrics.leads_contacted) / metrics.total_leads * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Contacted</span>
                    <span className="font-medium text-gray-900">
                      {((metrics.leads_contacted / metrics.total_leads) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max(1, (metrics.leads_contacted / metrics.total_leads) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Channel Ready */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Channels Ready</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <MessageSquare size={18} className="text-green-600" />
                    WhatsApp
                  </span>
                  <span className="font-semibold text-gray-900">
                    {((metrics.leads_whatsapp_ready / metrics.total_leads) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Mail size={18} className="text-blue-600" />
                    Email
                  </span>
                  <span className="font-semibold text-gray-900">
                    {((metrics.leads_email_ready / metrics.total_leads) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Globe size={18} className="text-orange-600" />
                    Website
                  </span>
                  <span className="font-semibold text-gray-900">
                    {((metrics.leads_with_website / metrics.total_leads) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Import leads from CSV or Data Miner export</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Review and filter leads by location, industry, and contact info</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Set up WhatsApp and Email outreach templates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Launch outreach campaigns (Phase 4)</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
