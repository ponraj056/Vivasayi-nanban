import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function DiseaseCheck() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/disease/detect', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-10">
      <h2 className="text-3xl font-bold text-green-800 mb-2">Plant Disease Checker</h2>
      <p className="text-gray-600 mb-8">Upload a clear photo of the affected leaf for an instant AI diagnosis.</p>

      {/* Upload Box */}
      <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:bg-green-50 transition-colors">
        <input 
          type="file" 
          id="leaf-upload" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        <label htmlFor="leaf-upload" className="cursor-pointer flex flex-col items-center">
          {preview ? (
            <img src={preview} alt="Leaf preview" className="h-48 object-cover rounded-lg shadow-md mb-4" />
          ) : (
            <UploadCloud className="w-16 h-16 text-green-500 mb-4" />
          )}
          <span className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition">
            {preview ? 'Choose a different photo' : 'Select Leaf Photo'}
          </span>
        </label>
      </div>

      {/* Action Button */}
      {file && (
        <div className="mt-6 text-center">
          <button 
            onClick={handleUpload} 
            disabled={loading}
            className="w-full sm:w-auto bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-800 transition disabled:opacity-50 flex justify-center items-center gap-2 mx-auto"
          >
            {loading ? <><Loader className="animate-spin" /> Analyzing...</> : 'Analyze Image'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-sm border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-600 w-8 h-8" />
            <h3 className="text-2xl font-bold text-gray-800">Diagnosis Complete</h3>
          </div>
          <div className="space-y-3 text-lg">
            <p><span className="font-semibold text-gray-700">Detected Disease:</span> <span className="text-green-700 font-bold">{result.disease}</span></p>
            <p><span className="font-semibold text-gray-700">Confidence:</span> {(result.confidence * 100).toFixed(1)}%</p>
            <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Recommendation:</h4>
              <p className="text-gray-600 leading-relaxed">{result.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
