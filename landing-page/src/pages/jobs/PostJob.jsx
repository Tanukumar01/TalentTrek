import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './PostJob.css';

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
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Save job to localStorage (for demo)
    const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const newJob = {
      ...form,
      id: Date.now(),
      postedBy: user?.email,
      postedAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    setLoading(false);
    toast.success('Job posted successfully!');
    navigate('/dashboard');
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