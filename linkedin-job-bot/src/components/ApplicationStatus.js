import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ApplicationStatus() {
  const [status, setStatus] = useState({
    isRunning: false,
    currentJob: null,
    totalApplied: 0,
    errors: [],
  });

  useEffect(() => {
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/status`);
      if (response.data.success) {
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  if (!status.isRunning && !status.currentJob) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Application Progress</h3>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {status.isRunning ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                ✓
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800">
              {status.isRunning ? 'Bot is running...' : 'Application process completed'}
            </p>
            {status.currentJob && (
              <p className="text-gray-600">Currently applying to: {status.currentJob}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-medium">Applications Submitted</span>
            <span className="text-3xl font-bold text-blue-600">{status.totalApplied}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((status.totalApplied / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {status.errors && status.errors.length > 0 && (
          <div className="bg-red-50 rounded-lg p-6">
            <h4 className="font-semibold text-red-900 mb-3">Errors Encountered</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {status.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">
                  • {error}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The bot is running in the background. You can close this window,
            but keep the server running. Check back later to see the results.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApplicationStatus;
