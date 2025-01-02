"use client";

import Image from "next/image";
import { useState } from "react";
import { CloudUpload, Paperclip, X, Sparkles } from "lucide-react";
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
  attention_map_visualization: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<string>("");
  const [displayedSuggestions, setDisplayedSuggestions] = useState<string>("");
  const [treatmentSuggestions, setTreatmentSuggestions] = useState<string>("");
  const [displayedTreatment, setDisplayedTreatment] = useState<string>("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingTreatment, setIsLoadingTreatment] = useState(false);

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
    setSuggestions("");
    setDisplayedSuggestions("");
    setTreatmentSuggestions("");
    setDisplayedTreatment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/model/predict`,
        formData
      );
      const analysisResult = response.data;
      
      console.log('Full response data:', analysisResult);
      console.log('Attention map visualization present:', !!analysisResult.attention_map_visualization);
      if (analysisResult.attention_map_visualization) {
        console.log('Attention map visualization length:', analysisResult.attention_map_visualization.length);
      }
      saveResult(analysisResult, file.name);
      setResult(analysisResult);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateTyping = (text: string, setDisplay: React.Dispatch<React.SetStateAction<string>>, delay: number = 20) => {
    let i = 0;
    setDisplay("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplay((prev: string) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);
  };

  const getAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    setDisplayedSuggestions("");
    try {
      const response = await axios.post('/api/suggestions', {
        prediction: result?.predicted_class,
        confidence: result?.class_probabilities[result?.predicted_class || '']
      });

      setSuggestions(response.data.suggestions);
      simulateTyping(response.data.suggestions, setDisplayedSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           `Request failed: ${error.response?.status} ${error.response?.statusText}`;
        alert(errorMessage);
      } else {
        alert('Failed to get suggestions: An unexpected error occurred');
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getTreatmentSuggestions = async () => {
    setIsLoadingTreatment(true);
    setDisplayedTreatment("");
    try {
      const response = await axios.post('/api/treatment', {
        prediction: result?.predicted_class,
        confidence: result?.class_probabilities[result?.predicted_class || '']
      });

      setTreatmentSuggestions(response.data.suggestions);
      simulateTyping(response.data.suggestions, setDisplayedTreatment);
    } catch (error) {
      console.error('Error getting treatment suggestions:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           `Request failed: ${error.response?.status} ${error.response?.statusText}`;
        alert(errorMessage);
      } else {
        alert('Failed to get treatment suggestions: An unexpected error occurred');
      }
    } finally {
      setIsLoadingTreatment(false);
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
              <div className="space-y-6">
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

                {/* Treatment & Management Suggestions */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Treatment & Management</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.predicted_class === 'NonDemented' ? 'bg-green-100 text-green-800' :
                        result.predicted_class === 'VeryMildDemented' ? 'bg-yellow-100 text-yellow-800' :
                        result.predicted_class === 'MildDemented' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.predicted_class}
                            </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {!treatmentSuggestions ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <button
                          onClick={getTreatmentSuggestions}
                          disabled={isLoadingTreatment || !suggestions}
                          className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isLoadingTreatment ? "Generating..." : 
                           !suggestions ? "Analyze Attention Map First" : 
                           "Get Treatment Suggestions"}
                        </button>
                        {!suggestions && (
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            Please analyze the attention map before getting treatment suggestions
                          </p>
                        )}
                      </div>
                    ) : isLoadingTreatment ? (
                      <div className="space-y-6">
                        <div className="prose prose-emerald prose-sm max-w-none">
                          <div className="relative pl-4 text-gray-600 leading-relaxed min-h-[100px] flex items-center">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 rounded-full"></div>
                            <div className="w-full">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-200"></div>
                                <span className="text-sm text-emerald-600 animate-pulse">AI is writing treatment recommendations...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="prose prose-emerald prose-sm max-w-none">
                          <div className="relative pl-4 text-gray-600 leading-relaxed">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 rounded-full"></div>
                            <p className="whitespace-pre-line text-sm">{displayedTreatment}</p>
                            {displayedTreatment !== treatmentSuggestions && (
                              <span className="inline-block w-1 h-4 bg-emerald-500 ml-1 animate-blink"></span>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <p className="text-xs text-gray-500 text-center">
                            These are general recommendations. Please consult with healthcare providers for personalized advice.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            )}
      </div>

          {/* Right Column: Scan Preview and Attention Map */}
          <div className="w-full space-y-8">
            {/* Original Scan - Hidden when attention map is shown */}
            {!result?.attention_map_visualization && (
              <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Scan Preview</h2>
                <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
            {imageUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={imageUrl}
                        alt="Scan preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
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
            )}

            {/* Attention Map Section */}
            {result?.attention_map_visualization && (
              <div className="space-y-6">
                {/* Attention Map Visualization */}
                <div className="relative">
                  <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
                    <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">Model Attention Map</h2>

                    <div className="w-full">
                      <Image
                        src={`data:image/png;base64,${result.attention_map_visualization}`}
                        alt="Model attention map"
                        width={400}
                        height={200}
                        className="w-full rounded-lg shadow-md"
                        unoptimized
                      />
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          The colored regions show areas the model focused on for its prediction.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Brighter areas indicate stronger attention weights
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Legend - Positioned Absolutely */}
                  <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col justify-center space-y-2 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded shadow-sm" style={{ background: 'linear-gradient(to right, #ff8c00, #ff0000)' }} />
                      <span className="text-xs text-gray-600 whitespace-nowrap">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded shadow-sm" style={{ background: 'linear-gradient(to right, #00ffff, #ffff00)' }} />
                      <span className="text-xs text-gray-600 whitespace-nowrap">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded shadow-sm" style={{ background: 'linear-gradient(to right, #000080, #0000ff)' }} />
                      <span className="text-xs text-gray-600 whitespace-nowrap">Low</span>
                    </div>
                  </div>
                </div>

                {/* Interpretation Section */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {/* Header with Title */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">Attention Map Interpretation</h3>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex justify-center">
                      <button
                        onClick={getAISuggestions}
                        disabled={isLoadingSuggestions}
                        className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isLoadingSuggestions ? "Analyzing..." : "Analyze Attention Map"}
                      </button>
                    </div>

                    {/* Analysis Results */}
                    {isLoadingSuggestions ? (
                      <div className="mt-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full"></div>
                          <div className="flex items-center space-x-2 px-3">
                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            <h4 className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap">
                              Analyzing...
                            </h4>
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full"></div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-lg transform rotate-0.5 opacity-70"></div>
                          <div className="relative bg-white rounded-lg p-5 shadow-md border border-indigo-100">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : suggestions && (
                      <div className="mt-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full"></div>
                          <div className="flex items-center space-x-2 px-3">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap">
                              Expert Analysis
                            </h4>
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full"></div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-lg transform rotate-0.5 opacity-70"></div>
                          <div className="relative bg-white rounded-lg p-5 shadow-md border border-indigo-100">
                            <div className="prose prose-indigo prose-sm max-w-none">
                              <div className="relative pl-4 text-gray-600 leading-relaxed">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/20 via-indigo-500/50 to-indigo-500/20 rounded-full"></div>
                                <p className="whitespace-pre-line text-sm">{displayedSuggestions}</p>
                                {displayedSuggestions !== suggestions && (
                                  <span className="inline-block w-1 h-4 bg-indigo-500 ml-1 animate-blink"></span>
                                )}
                              </div>
                            </div>
                            {displayedSuggestions === suggestions && (
                              <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                <button
                                  onClick={() => {
                                    const content = `Attention Map Analysis\n\nPatient Diagnosis: ${result?.predicted_class}\nConfidence: ${(result?.class_probabilities[result?.predicted_class || ''] * 100).toFixed(1)}%\n\nAnalysis:\n${suggestions}`;
                                    const blob = new Blob([content], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `attention_map_analysis_${new Date().toISOString().split('T')[0]}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Export Analysis
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Treatment Content */}
                        {treatmentSuggestions && displayedTreatment === treatmentSuggestions && (
                          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => {
                                const content = `Treatment & Management Recommendations\n\nPatient Diagnosis: ${result?.predicted_class}\nConfidence: ${(result?.class_probabilities[result?.predicted_class || ''] * 100).toFixed(1)}%\n\nRecommendations:\n${treatmentSuggestions}`;
                                const blob = new Blob([content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `treatment_recommendations_${new Date().toISOString().split('T')[0]}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="inline-flex items-center px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Export Recommendations
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
