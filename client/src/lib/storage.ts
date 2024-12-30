interface AnalysisResult {
  predicted_class: 'NonDemented' | 'VeryMildDemented' | 'MildDemented' | 'ModerateDemented';
  class_probabilities: {
    NonDemented: number;
    VeryMildDemented: number;
    MildDemented: number;
    ModerateDemented: number;
  };
  attention_map_visualization?: string; // Optional, not stored
}

export interface StoredResult {
  id: string;
  timestamp: string;
  fileName: string;
  predicted_class: AnalysisResult['predicted_class'];
  class_probabilities: AnalysisResult['class_probabilities'];
}

const STORAGE_KEY = 'alzdetect_results';

export const saveResult = (result: AnalysisResult, fileName: string) => {
  const storedResult: StoredResult = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    fileName,
    predicted_class: result.predicted_class,
    class_probabilities: result.class_probabilities
  };

  const existingResults = getResults();
  const updatedResults = [storedResult, ...existingResults];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
  return storedResult;
};

export const getResults = (): StoredResult[] => {
  const results = localStorage.getItem(STORAGE_KEY);
  return results ? JSON.parse(results) : [];
};

export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
}; 