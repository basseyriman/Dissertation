"use client";

import { Navbar } from "@/components/Navbar";
import { Download, Printer, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { StoredResult, getResults, clearResults } from "@/lib/storage";

export default function Results() {
  const [results, setResults] = useState<StoredResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load results when the component mounts
    setResults(getResults());

    // Add event listener for storage changes
    const handleStorageChange = () => {
      setResults(getResults());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const exportToCSV = () => {
    // Create CSV headers
    const headers = [
      "Date",
      "File Name",
      "Predicted Class",
      "Confidence",
      "NonDemented Probability",
      "VeryMildDemented Probability",
      "MildDemented Probability",
      "ModerateDemented Probability"
    ].join(",");

    // Create CSV rows
    const rows = results.map(result => [
      new Date(result.timestamp).toLocaleString(),
      result.fileName,
      result.predicted_class,
      (result.class_probabilities[result.predicted_class] * 100).toFixed(1) + "%",
      (result.class_probabilities.NonDemented * 100).toFixed(1) + "%",
      (result.class_probabilities.VeryMildDemented * 100).toFixed(1) + "%",
      (result.class_probabilities.MildDemented * 100).toFixed(1) + "%",
      (result.class_probabilities.ModerateDemented * 100).toFixed(1) + "%"
    ].join(","));

    // Combine headers and rows
    const csv = [headers, ...rows].join("\n");

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `analysis_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (selectedResults.size === 0) {
      alert('Please select at least one result to print');
      return;
    }

    const selectedItems = results.filter(result => selectedResults.has(result.id));
    const printContent = `
      <html>
        <head>
          <title>AlzDetect Analysis Reports</title>
          <style>
            @media print {
              .page-break { 
                page-break-before: always;
                margin-top: 0;
              }
              @page {
                margin: 0;
                size: A4;
              }
              body {
                margin: 0;
              }
              .report-page {
                page-break-after: always;
                height: 100vh;
                padding: 40px;
                box-sizing: border-box;
                position: relative;
              }
              .report-page:last-child {
                page-break-after: avoid;
              }
            }
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0;
            }
            .report-page {
              padding: 40px;
              position: relative;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px; }
            .date { color: #64748b; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: 600; color: #334155; margin-bottom: 10px; }
            .prediction { 
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 500;
            }
            .probability-bar {
              width: 100%;
              height: 8px;
              background: #f1f5f9;
              border-radius: 4px;
              margin: 4px 0;
            }
            .probability-fill {
              height: 100%;
              border-radius: 4px;
            }
            .footer { 
              margin-top: 40px;
              text-align: center;
              color: #64748b;
              font-size: 12px;
              position: absolute;
              bottom: 40px;
              left: 0;
              right: 0;
            }
          </style>
        </head>
        <body>
          ${selectedItems.map((result) => `
            <div class="report-page">
              <div class="header">
                <div class="title">AlzDetect Analysis Report</div>
                <div class="date">Generated on ${new Date().toLocaleString()}</div>
              </div>

              <div class="section">
                <div class="section-title">Scan Information</div>
                <p>File Name: ${result.fileName}</p>
                <p>Analysis Date: ${new Date(result.timestamp).toLocaleString()}</p>
              </div>

              <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div class="section-title" style="margin: 0;">Analysis Results</div>
                  <div style="text-align: right;">
                    <p style="margin-bottom: 4px;">Prediction: <span class="prediction" style="
                      ${result.predicted_class === 'NonDemented' ? 'background: #dcfce7; color: #166534;' :
                        result.predicted_class === 'VeryMildDemented' ? 'background: #fef9c3; color: #854d0e;' :
                        result.predicted_class === 'MildDemented' ? 'background: #ffedd5; color: #9a3412;' :
                        'background: #fee2e2; color: #991b1b;'}">${result.predicted_class}</span></p>
                    <p style="margin: 0;">Confidence: ${(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Other Class Probabilities</div>
                ${Object.entries(result.class_probabilities)
                  .filter(([className]) => className !== result.predicted_class)
                  .sort(([, a], [, b]) => b - a)
                  .map(([className, probability]) => `
                    <div style="margin-bottom: 12px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>${className}</span>
                        <span>${(probability * 100).toFixed(1)}%</span>
                      </div>
                      <div class="probability-bar">
                        <div class="probability-fill" style="width: ${probability * 100}%; ${
                          className === 'NonDemented' ? 'background: #22c55e;' :
                          className === 'VeryMildDemented' ? 'background: #eab308;' :
                          className === 'MildDemented' ? 'background: #f97316;' :
                          'background: #ef4444;'
                        }"></div>
                      </div>
                    </div>
                  `).join('')}
              </div>

              <div class="footer">
                Generated by AlzDetect - Brain MRI Analysis System
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const toggleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r.id)));
    }
  };

  const filteredResults = selectedFilter === "all" 
    ? results 
    : results.filter(result => result.predicted_class === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Analysis History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage your previous MRI scan analysis results
          </p>
        </div>

        {results.length > 0 ? (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Results</option>
                    <option value="NonDemented">Non-Demented</option>
                    <option value="VeryMildDemented">Very Mild Demented</option>
                    <option value="MildDemented">Mild Demented</option>
                    <option value="ModerateDemented">Moderate Demented</option>
                  </select>
                  <span className="text-sm text-gray-500">
                    Showing {filteredResults.length} of {results.length} results
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-2 bg-white text-gray-700 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all results? This cannot be undone.')) {
                        clearResults();
                        setResults([]);
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      <input
                        type="checkbox"
                        checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">File Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prediction</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Confidence</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Other Probabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedResults.has(result.id)}
                          onChange={() => {
                            const newSelected = new Set(selectedResults);
                            if (newSelected.has(result.id)) {
                              newSelected.delete(result.id);
                            } else {
                              newSelected.add(result.id);
                            }
                            setSelectedResults(newSelected);
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(result.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{result.fileName}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${result.predicted_class === 'NonDemented' ? 'bg-green-100 text-green-800' :
                            result.predicted_class === 'VeryMildDemented' ? 'bg-yellow-100 text-yellow-800' :
                            result.predicted_class === 'MildDemented' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'}`}>
                          {result.predicted_class}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {Object.entries(result.class_probabilities)
                            .filter(([className]) => className !== result.predicted_class)
                            .sort(([, a], [, b]) => b - a)
                            .map(([className, probability]) => (
                              <div key={className} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{className}:</span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      className === 'NonDemented' ? 'bg-green-500' :
                                      className === 'VeryMildDemented' ? 'bg-yellow-500' :
                                      className === 'MildDemented' ? 'bg-orange-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${probability * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{(probability * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8">
            <p className="text-center text-gray-500">No analysis results available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
