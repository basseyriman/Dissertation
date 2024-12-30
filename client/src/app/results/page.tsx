"use client";

import { Navbar } from "@/components/Navbar";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { StoredResult, getResults } from "@/lib/storage";

export default function Results() {
  const [results, setResults] = useState<StoredResult[]>([]);

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
      "ID",
      "Timestamp",
      "File Name",
      "Predicted Class",
      "NonDemented Probability",
      "VeryMildDemented Probability",
      "MildDemented Probability",
      "ModerateDemented Probability"
    ].join(",");

    // Create CSV rows
    const rows = results.map(result => [
      result.id,
      result.timestamp,
      result.fileName,
      result.predicted_class,
      result.class_probabilities.NonDemented,
      result.class_probabilities.VeryMildDemented,
      result.class_probabilities.MildDemented,
      result.class_probabilities.ModerateDemented
    ].join(","));

    // Combine headers and rows
    const csv = [headers, ...rows].join("\n");

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'analysis_results.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Analysis History
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              View and manage your previous MRI scan analysis results
            </p>
          </div>
          <div className="absolute right-0 top-0">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={results.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">File Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prediction</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(result.timestamp).toLocaleDateString()}
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
