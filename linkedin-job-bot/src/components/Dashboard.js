import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ onStartApplications, isApplying }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    failed: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/applications`);
      if (response.data.success) {
        const apps = response.data.applications;
        setApplications(apps);
        
        const applied = apps.filter(app => app.status === 'applied').length;
        const failed = apps.filter(app => app.status === 'failed').length;
        const total = apps.length;
        
        setStats({
          total,
          applied,
          failed,
          successRate: total > 0 ? Math.round((applied / total) * 100) : 0,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600">Monitor your job applications</p>
          </div>
          <button
            onClick={onStartApplications}
            disabled={isApplying}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              isApplying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isApplying ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Applying...
              </span>
            ) : (
              '🚀 Start Applying to Jobs'
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Successfully Applied"
            value={stats.applied}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Failed"
            value={stats.failed}
            icon="❌"
            color="red"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon="📈"
            color="purple"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-xl text-gray-600 mb-2">No applications yet</p>
            <p className="text-gray-500">Click "Start Applying to Jobs" to begin</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Applications</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {applications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-4xl font-bold">{value}</span>
      </div>
      <p className="text-sm opacity-90">{title}</p>
    </div>
  );
}

function ApplicationCard({ application }) {
  const statusColors = {
    applied: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    applied: '✓',
    failed: '✗',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-lg">{application.jobTitle}</h4>
          <p className="text-gray-600">{application.company}</p>
          <p className="text-sm text-gray-500">{application.location}</p>
          {application.error && (
            <p className="text-sm text-red-600 mt-2">Error: {application.error}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[application.status]
            }`}
          >
            {statusIcons[application.status]} {application.status.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(application.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {application.jobUrl && (
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
        >
          View Job →
        </a>
      )}
    </div>
  );
}

export default Dashboard;
