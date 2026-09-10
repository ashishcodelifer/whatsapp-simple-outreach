import React from 'react';
import { Settings as SettingsIcon, Lock, Bell, Zap } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your dashboard configuration</p>
      </div>

      {/* Coming Soon */}
      <div className="card border-l-4 border-blue-600">
        <div className="flex gap-4">
          <Zap className="text-blue-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Settings Coming in Phase 2</h3>
            <p className="text-blue-800 text-sm mb-4">
              Settings will include WhatsApp API configuration, email templates, and outreach rules.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Settings */}
        <div className="card border border-gray-200 opacity-50 pointer-events-none">
          <div className="flex items-start gap-3 mb-4">
            <SettingsIcon size={24} className="text-gray-400" />
            <h3 className="font-semibold text-gray-600">WhatsApp Configuration</h3>
          </div>
          <p className="text-sm text-gray-500">
            Configure WhatsApp Business API credentials and message templates
          </p>
        </div>

        {/* Email Settings */}
        <div className="card border border-gray-200 opacity-50 pointer-events-none">
          <div className="flex items-start gap-3 mb-4">
            <SettingsIcon size={24} className="text-gray-400" />
            <h3 className="font-semibold text-gray-600">Email Configuration</h3>
          </div>
          <p className="text-sm text-gray-500">
            Set up SMTP, sender address, and email templates
          </p>
        </div>

        {/* Notifications */}
        <div className="card border border-gray-200 opacity-50 pointer-events-none">
          <div className="flex items-start gap-3 mb-4">
            <Bell size={24} className="text-gray-400" />
            <h3 className="font-semibold text-gray-600">Notifications</h3>
          </div>
          <p className="text-sm text-gray-500">
            Email alerts for import completion and outreach results
          </p>
        </div>

        {/* Security */}
        <div className="card border border-gray-200 opacity-50 pointer-events-none">
          <div className="flex items-start gap-3 mb-4">
            <Lock size={24} className="text-gray-400" />
            <h3 className="font-semibold text-gray-600">Security</h3>
          </div>
          <p className="text-sm text-gray-500">
            API keys, rate limiting, and access control
          </p>
        </div>
      </div>

      {/* Roadmap */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Settings Roadmap</h3>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li><strong>Phase 2:</strong> WhatsApp/Email API setup and message templates</li>
          <li><strong>Phase 3:</strong> Lead enrichment data source configuration</li>
          <li><strong>Phase 4:</strong> Outreach campaign scheduling and rules</li>
          <li><strong>Phase 5:</strong> Analytics dashboard and campaign reports</li>
        </ol>
      </div>
    </div>
  );
}
