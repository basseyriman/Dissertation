interface AnalysisResult {
  predicted_class: 'NonDemented' | 'VeryMildDemented' | 'MildDemented' | 'ModerateDemented';
  class_probabilities: {
    NonDemented: number;
    VeryMildDemented: number;
    MildDemented: number;
    ModerateDemented: number;
  };
}

export interface StoredResult extends AnalysisResult {
  id: string;
  timestamp: string;
  fileName: string;
}

const STORAGE_KEY = 'alzdetect_results';

export const saveResult = (result: AnalysisResult, fileName: string) => {
  const storedResult: StoredResult = {
    ...result,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    fileName
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