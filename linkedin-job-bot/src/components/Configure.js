import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Configure({ onConfigured, cvData }) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    experienceLevel: 'entry',
    jobType: 'full-time',
    remote: 'any',
    maxApplications: 10,
    linkedinEmail: '',
    linkedinPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.location || !formData.linkedinEmail || !formData.linkedinPassword) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/configure`, {
        jobPreferences: {
          jobTitle: formData.jobTitle,
          location: formData.location,
          experienceLevel: formData.experienceLevel,
          jobType: formData.jobType,
          remote: formData.remote,
          maxApplications: parseInt(formData.maxApplications),
        },
        linkedinCredentials: {
          email: formData.linkedinEmail,
          password: formData.linkedinPassword,
        },
      });

      if (response.data.success) {
        onConfigured(formData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save configuration. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Configure Job Preferences</h2>
      <p className="text-gray-600 mb-6">Tell us what kind of jobs you're looking for</p>

      {cvData && cvData.parsedData && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">CV Parsed Successfully!</h3>
          <p className="text-sm text-green-800">
            Name: {cvData.parsedData.name} | Email: {cvData.parsedData.email}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="internship">Internship</option>
              <option value="entry">Entry Level</option>
              <option value="associate">Associate</option>
              <option value="mid-senior">Mid-Senior Level</option>
              <option value="director">Director</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remote Preference
            </label>
            <select
              name="remote"
              value={formData.remote}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any</option>
              <option value="remote">Remote Only</option>
              <option value="onsite">On-site Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Applications per Session
            </label>
            <input
              type="number"
              name="maxApplications"
              value={formData.maxApplications}
              onChange={handleChange}
              min="1"
              max="50"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">LinkedIn Credentials</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your credentials are encrypted and stored securely. They're only used to log into LinkedIn.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn Email *
              </label>
              <input
                type="email"
                name="linkedinEmail"
                value={formData.linkedinEmail}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="linkedinPassword"
                  value={formData.linkedinPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {saving ? 'Saving Configuration...' : 'Save and Continue'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Make sure your LinkedIn account doesn't have 2FA enabled</li>
          <li>• The bot will only apply to "Easy Apply" jobs</li>
          <li>• Applications are rate-limited to avoid detection</li>
        </ul>
      </div>
    </div>
  );
}

export default Configure;
