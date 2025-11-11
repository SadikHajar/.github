import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadCV from './components/UploadCV';
import Configure from './components/Configure';
import Dashboard from './components/Dashboard';
import ApplicationStatus from './components/ApplicationStatus';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvData, setCvData] = useState(null);
  const [config, setConfig] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const cvResponse = await axios.get(`${API_URL}/cv`);
      if (cvResponse.data.success && cvResponse.data.data) {
        setCvData(cvResponse.data.data);
        setCurrentStep(2);
      }

      const configResponse = await axios.get(`${API_URL}/config`);
      if (configResponse.data.success && configResponse.data.data) {
        setConfig(configResponse.data.data);
        if (cvResponse.data.success && cvResponse.data.data) {
          setCurrentStep(3);
        }
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    }
  };

  const handleCVUploaded = (data) => {
    setCvData(data);
    setCurrentStep(2);
  };

  const handleConfigured = (configData) => {
    setConfig(configData);
    setCurrentStep(3);
  };

  const handleStartApplications = async () => {
    try {
      setIsApplying(true);
      const response = await axios.post(`${API_URL}/start-applications`);
      if (response.data.success) {
        alert('Application process started! The bot will now apply to jobs automatically.');
      }
    } catch (error) {
      console.error('Error starting applications:', error);
      alert('Failed to start application process: ' + (error.response?.data?.error || error.message));
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? This will not delete your saved data.')) {
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            LinkedIn Job Application Bot
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your CV and let AI apply to jobs automatically
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <StepIndicator number={1} active={currentStep === 1} completed={currentStep > 1} label="Upload CV" />
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <StepIndicator number={2} active={currentStep === 2} completed={currentStep > 2} label="Configure" />
            <div className="w-16 h-1 bg-gray-300 rounded"></div>
            <StepIndicator number={3} active={currentStep === 3} completed={false} label="Apply" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && <UploadCV onUploaded={handleCVUploaded} />}
          {currentStep === 2 && <Configure onConfigured={handleConfigured} cvData={cvData} />}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Dashboard onStartApplications={handleStartApplications} isApplying={isApplying} />
              {isApplying && <ApplicationStatus />}
            </div>
          )}
        </div>

        {currentStep > 1 && (
          <div className="text-center mt-8">
            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ number, active, completed, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-blue-600 text-white ring-4 ring-blue-200'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`mt-2 text-sm font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

export default App;
