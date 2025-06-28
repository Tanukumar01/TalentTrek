import React from 'react';
import './Dashboard.css';

const jobs = [
  {
    company: 'Google',
    title: 'Software Engineer',
    location: 'Mountain View, CA',
    applyUrl: 'https://careers.google.com/jobs/results/'
  },
  {
    company: 'Microsoft',
    title: 'Cloud Solutions Architect',
    location: 'Redmond, WA',
    applyUrl: 'https://careers.microsoft.com/us/en/search-results'
  },
  {
    company: 'Amazon',
    title: 'Data Scientist',
    location: 'Seattle, WA',
    applyUrl: 'https://www.amazon.jobs/en/'
  },
  {
    company: 'Infosys',
    title: 'Business Analyst',
    location: 'Bangalore, India',
    applyUrl: 'https://www.infosys.com/careers/'
  },
  {
    company: 'Tata Consultancy Services',
    title: 'Project Manager',
    location: 'Mumbai, India',
    applyUrl: 'https://www.tcs.com/careers'
  },
  {
    company: 'Accenture',
    title: 'UI/UX Designer',
    location: 'Dublin, Ireland',
    applyUrl: 'https://www.accenture.com/in-en/careers'
  },
];

const CompaniesDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Companies & Jobs</h1>
          <p>Explore jobs from top companies</p>
        </div>
      </div>
      <div className="stats-grid">
        {jobs.map((job, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-content">
              <h3>{job.title}</h3>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="apply-link">Apply Now →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompaniesDashboard; 