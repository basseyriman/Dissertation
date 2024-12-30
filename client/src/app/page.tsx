"use client";

import Image from "next/image";
import { useState } from "react";
import { CloudUpload, Paperclip, X } from "lucide-react";
import axios from "axios";
import { Navbar } from "@/components/Navbar";
import { saveResult } from "@/lib/storage";

interface AnalysisResult {
  predicted_class: 'NonDemented' | 'VeryMildDemented' | 'MildDemented' | 'ModerateDemented';
  class_probabilities: {
    NonDemented: number;
    VeryMildDemented: number;
    MildDemented: number;
    ModerateDemented: number;
  };
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setImageUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    return validTypes.includes(file.type);
  };

  const removeFile = () => {
    setFile(null);
    setImageUrl("");
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post(
        "http://localhost:8001/model/predict",
        formData
      );
      const analysisResult = response.data;
      saveResult(analysisResult, file.name);
      setResult(analysisResult);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Brain MRI Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your MRI scan and analyze potential anomalies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Upload Form and Results */}
          <div className="w-full space-y-8">
            {/* Upload Form */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Upload Scan</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300
                    ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' : 'border-gray-200'}
                    ${file ? 'bg-gray-50/50' : 'hover:bg-gray-50/50 hover:border-gray-300'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ display: file ? 'none' : 'block' }}
                  />
                  
                  {!file ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-indigo-50 rounded-full">
                        <CloudUpload className="w-10 h-10 text-indigo-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-indigo-600">Click to upload</span>
                          {" "}or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: SVG, PNG, JPG or GIF
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Paperclip className="h-5 w-5 text-indigo-500" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!file || isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-medium
                    shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                    transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Analyze Scan"}
                </button>
              </form>
            </div>

            {/* Results Card */}
            {result && (
              <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-medium
                    ${result.predicted_class === 'NonDemented' ? 'bg-green-100 text-green-800' :
                      result.predicted_class === 'VeryMildDemented' ? 'bg-yellow-100 text-yellow-800' :
                      result.predicted_class === 'MildDemented' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'}`}>
                    Predicted: {result.predicted_class}
                    <div className="text-xs font-normal mt-1">
                      Confidence: {(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* First show the predicted class probability */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">{result.predicted_class}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {(result.class_probabilities[result.predicted_class] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        result.predicted_class === 'NonDemented' ? 'bg-green-500' :
                        result.predicted_class === 'VeryMildDemented' ? 'bg-yellow-500' :
                        result.predicted_class === 'MildDemented' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${result.class_probabilities[result.predicted_class] * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-t mt-4 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Probabilities</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(result.class_probabilities)
                        .filter(([className]) => className !== result.predicted_class)
                        .sort(([, a], [, b]) => b - a)
                        .map(([className, probability]) => (
                          <div key={className} className="relative">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-600">{className}</span>
                              <span className="text-sm font-bold text-gray-900">
                                {(probability * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  className === 'NonDemented' ? 'bg-green-500' :
                                  className === 'VeryMildDemented' ? 'bg-yellow-500' :
                                  className === 'MildDemented' ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${probability * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Scan Preview */}
          <div className="w-full">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Scan Preview</h2>
              <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Scan preview"
                    fill
                    className="object-contain p-4 transition-opacity duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">Upload scan to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
