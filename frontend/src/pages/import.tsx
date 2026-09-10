import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, XCircle, FileUp } from 'lucide-react';
import { importAPI } from '@/lib/api';

interface ImportResult {
  total_imported: number;
  duplicates_found: number;
  errors_found: number;
  error_details: string[];
  lead_ids: number[];
}

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setError('Please upload a CSV or XLSX file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await importAPI.csv(file);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import file');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
        <p className="text-gray-600 mt-2">
          Upload CSV or XLSX files from Data Miner, Bright Data, or your own sources
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />

          <FileUp className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drop your file here or click to browse
          </h3>
          <p className="text-gray-600 mb-4">Supports CSV and XLSX formats</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Uploading...' : 'Select File'}
          </button>
        </div>
      </div>

      {/* Column Mapping Guide */}
      <div className="card border-l-4 border-blue-600">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Columns</h3>
        <p className="text-gray-600 mb-4">
          Your file will be automatically mapped. Common column names are detected:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Business Name (company, name)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Optional</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Category, Industry, Type, Sector</li>
              <li>• Location, Address, Region, City, Country</li>
              <li>• Website, URL, Web</li>
              <li>• Phone, Telephone, Email</li>
              <li>• WhatsApp</li>
              <li>• Source ID</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex gap-4">
            <XCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Import Failed</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="card space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Imported */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Imported</p>
                    <p className="text-2xl font-bold text-green-600">{result.total_imported}</p>
                  </div>
                </div>
              </div>

              {/* Duplicates */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Duplicates Skipped</p>
                    <p className="text-2xl font-bold text-yellow-600">{result.duplicates_found}</p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Errors</p>
                    <p className="text-2xl font-bold text-red-600">{result.errors_found}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Detection Methods */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Duplicate Detection</h4>
            <p className="text-sm text-gray-600 mb-3">
              Duplicates are identified by:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Source ID (if provided)</li>
              <li>Domain/Website</li>
              <li>Phone Number</li>
              <li>Business Name + Location</li>
            </ul>
          </div>

          {/* Error Details */}
          {result.error_details.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Errors & Warnings</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.error_details.map((error, idx) => (
                    <li key={idx} className="text-yellow-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Success Message */}
          {result.total_imported > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">
                ✓ Successfully imported {result.total_imported} leads. They are now available in your
                {' '}
                <a href="/leads" className="font-semibold hover:underline">
                  leads dashboard
                </a>
              </p>
            </div>
          )}

          {/* Import Another */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setResult(null);
                setError(null);
                fileInputRef.current?.click();
              }}
              className="btn btn-primary"
            >
              Import Another File
            </button>
            <a href="/leads" className="btn btn-secondary">
              View All Leads
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
