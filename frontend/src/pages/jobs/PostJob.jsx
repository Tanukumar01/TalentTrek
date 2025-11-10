import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import { IoCloudUploadOutline } from 'react-icons/io5';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    company: user?.name || '',
    location: {
      country: 'India',
      city: 'Bangalore'
    },
    salary: {
      min: '',
      max: ''
    },
    type: ['Internship'],
    experienceLevel: ['3-5 years'],
    description: '',
    requirements: '',
    companyWebsite: '',
    category: ['Development'],
    logo: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'country' || e.target.name === 'city') {
      setForm({ ...form, location: { ...form.location, [e.target.name]: e.target.value } });
    } else if (e.target.name === 'min' || e.target.name === 'max') {
      setForm({ ...form, salary: { ...form.salary, [e.target.name]: e.target.value } });
    } else if (e.target.name === 'logo') {
      setForm({ ...form, logo: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add basic form fields
      formData.append('title', form.title);
      formData.append('company', form.company);
      formData.append('companyWebsite', form.companyWebsite);
      formData.append('description', form.description);
      
      // Add nested objects as JSON strings
      formData.append('location', JSON.stringify(form.location));
      formData.append('salary', JSON.stringify(form.salary));
      
      // Add arrays as JSON strings
      formData.append('type', JSON.stringify(form.type));
      formData.append('experienceLevel', JSON.stringify(form.experienceLevel));
      formData.append('category', JSON.stringify(form.category));
      
      // Add logo file if present
      if (form.logo) {
        formData.append('logo', form.logo);
      }
      
      const response = await fetch(API_ENDPOINTS.JOBS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header when using FormData
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Job posted successfully!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Only allow recruiters
  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only recruiters can post jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Post a Job</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-xl">
          {/* About Company Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">About Company</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Company*
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  placeholder="Zomentum"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website*
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={form.companyWebsite}
                  onChange={handleChange}
                  required
                  placeholder="www.zomentum.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="logo"
                    onChange={handleChange}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-100 transition-all flex items-center justify-between"
                  >
                    <span>{form.logo ? form.logo.name : 'Add your file here'}</span>
                    <div className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-white text-sm flex items-center gap-2">
                      <IoCloudUploadOutline />
                      Upload
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Job Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Profile
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Frontend Developer"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Job Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Development', 'UI Designing', 'Marketing', 'Sales'].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        const newCategories = form.category.includes(category)
                          ? form.category.filter(c => c !== category)
                          : [...form.category, category];
                        setForm({ ...form, category: newCategories });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        form.category.includes(category)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Internship', 'Freelance', 'Full Time', 'Include All'].map((type) => (
                    <label key={type} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={form.type.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...form.type, type]
                            : form.type.filter(t => t !== type);
                          setForm({ ...form, type: newTypes });
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="text-gray-700 text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Country*</label>
                    <select
                      name="country"
                      value={form.location.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">City*</label>
                    <select
                      name="city"
                      value={form.location.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="Frontend Developer"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Freshers', '3-5 years', '1-2 years', '6+ years'].map((level) => (
                    <label key={level} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={form.experienceLevel.includes(level)}
                        onChange={(e) => {
                          const newLevels = e.target.checked
                            ? [...form.experienceLevel, level]
                            : form.experienceLevel.filter(l => l !== level);
                          setForm({ ...form, experienceLevel: newLevels });
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="text-gray-700 text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range*
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min*</label>
                    <input
                      type="text"
                      name="min"
                      value={form.salary.min}
                      onChange={handleChange}
                      placeholder="35k"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max*</label>
                    <input
                      type="text"
                      name="max"
                      value={form.salary.max}
                      onChange={handleChange}
                      placeholder="55k"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Posting...' : 'Post Job →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob; 