import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PostJob.css';
import { API_ENDPOINTS } from '../../config/api';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    company: user?.name || '',
    location: '',
    salary: '',
    type: 'Full Time',
    description: '',
    requirements: '',
    companyWebsite: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.JOBS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
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
      <div className="postjob-container">
        <div className="postjob-card">
          <h2>Access Denied</h2>
          <p>Only recruiters can post jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="postjob-container">
      <div className="postjob-card">
        <h2>Post a New Job</h2>
        <form className="postjob-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Frontend Developer"
            />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              placeholder="Company name"
            />
          </div>
          <div className="form-group">
            <label>Company Website</label>
            <input
              type="url"
              name="companyWebsite"
              value={form.companyWebsite}
              onChange={handleChange}
              placeholder="https://company.com"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Remote, New York, etc."
            />
          </div>
          <div className="form-group">
            <label>Salary</label>
            <input
              type="text"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. $60,000 - $80,000"
            />
          </div>
          <div className="form-group">
            <label>Job Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Describe the job role, responsibilities, etc."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              required
              placeholder="List the requirements, skills, experience, etc."
              rows={3}
            />
          </div>
          <button type="submit" className="postjob-btn" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob; 