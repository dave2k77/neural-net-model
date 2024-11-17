import React, { useState } from 'react';
import { Upload, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ImageClassifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setPrediction(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call with random prediction
      // In reality, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      const randomPrediction = Math.random() > 0.5 ? 'Cat' : 'Dog';
      const confidence = (Math.random() * 30 + 70).toFixed(2); // Random confidence between 70-100%
      setPrediction({ label: randomPrediction, confidence });
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
    setIsLoading(false);
    // Reset the file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Cat vs Dog Classifier</h1>
        <p className="text-gray-600">Upload an image to classify whether it's a cat or a dog</p>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="h-12 w-12 text-gray-400" />
          <span className="text-gray-600">Click to upload an image</span>
        </label>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-64 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Buttons Section */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isLoading}
          className={`px-6 py-2 rounded-lg ${
            !selectedFile || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium transition-colors`}
        >
          {isLoading ? 'Processing...' : 'Classify Image'}
        </button>

        <button
          onClick={handleReset}
          className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Prediction Result */}
      {prediction && (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-bold text-green-800 mb-2">
            Prediction: {prediction.label}
          </h2>
          <p className="text-green-600">
            Confidence: {prediction.confidence}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
