import * as React from "react"

interface AnalysisResultProps {
  result: {
    file_name: string
    predicted_class: string
    confidence: number
    class_probabilities: {
      MildDemented: number
      ModerateDemented: number
      NonDemented: number
      VeryMildDemented: number
    }
  }
}

const formatProbability = (value: number): string => {
  return (value * 100).toFixed(1) + "%"
}

const getStatusColor = (className: string): string => {
  const baseColors = {
    NonDemented: "text-green-500",
    MildDemented: "text-yellow-500",
    ModerateDemented: "text-orange-500",
    VeryMildDemented: "text-red-500"
  }
  return baseColors[className as keyof typeof baseColors] || "text-gray-500"
}

const getProgressColor = (className: string): string => {
  const baseColors = {
    NonDemented: "bg-green-500",
    MildDemented: "bg-yellow-500",
    ModerateDemented: "bg-orange-500",
    VeryMildDemented: "bg-red-500"
  }
  return baseColors[className as keyof typeof baseColors] || "bg-gray-500"
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const {
    file_name,
    predicted_class,
    confidence,
    class_probabilities
  } = result

  return (
    <div className="bg-white rounded-xl border shadow-lg p-6 w-full max-w-3xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-2xl font-medium mb-2">
          Analysis Results
        </h3>
        <p className="text-sm text-gray-500 truncate">
          File: {file_name}
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-base font-medium mb-3">Prediction</h4>
          <div className="space-y-2">
            <p className={`text-3xl font-bold ${getStatusColor(predicted_class)}`}>
              {predicted_class}
            </p>
            <p className="text-sm text-gray-500">
              Confidence: {formatProbability(confidence)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium mb-4">Class Probabilities</h4>
          <div className="space-y-4">
            {Object.entries(class_probabilities).map(([className, probability]) => (
              <div key={className}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">{className}</span>
                  <span className="text-gray-500">
                    {formatProbability(probability)}
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${getProgressColor(className)}`}
                    style={{ width: `${probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 