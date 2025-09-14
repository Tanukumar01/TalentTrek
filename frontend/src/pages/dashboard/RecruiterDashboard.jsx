import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

const experienceFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Freshers', value: 'freshers' },
  { label: '0-2 years', value: '0-2' },
  { label: 'Above 2 years', value: '2plus' },
];

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');

  // Fetch jobs posted by recruiter
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ENDPOINTS.MY_JOBS, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs);
          if (data.jobs.length > 0) {
            setSelectedJobId(data.jobs[0]._id);
          }
        } else {
          setError(data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('Failed to fetch jobs');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applications for selected job
  useEffect(() => {
    if (!selectedJobId) return;
    const fetchApplications = async () => {
      setLoadingApps(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/jobs/${selectedJobId}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
        } else {
          setError(data.message || 'Failed to fetch applications');
        }
      } catch (err) {
        setError('Failed to fetch applications');
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApplications();
  }, [selectedJobId]);

  // Filter applications based on experience
  const getFilteredApplications = () => {
    return applications.filter(app => {
      // Try to extract experience from various possible formats
      let exp = 0;
      const experience = app.userId?.profile?.experience;
      
      if (Array.isArray(experience) && experience.length > 0) {
        // If it's an array, try to parse the first element
        const firstExp = experience[0];
        if (typeof firstExp === 'string') {
          // Try to extract years from string like "2 years" or "2"
          const match = firstExp.match(/(\d+)/);
          if (match) exp = parseInt(match[1], 10);
        } else if (typeof firstExp === 'number') {
          exp = firstExp;
        }
      } else if (typeof experience === 'string') {
        const match = experience.match(/(\d+)/);
        if (match) exp = parseInt(match[1], 10);
      } else if (typeof experience === 'number') {
        exp = experience;
      }
      
      switch (filter) {
        case 'freshers':
          return exp === 0;
        case '0-2':
          return exp > 0 && exp <= 2;
        case '2plus':
          return exp > 2;
        default:
          return true;
      }
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Recruiter Dashboard</h1>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {loadingJobs ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <>
          <div style={{ margin: '1.5rem 0' }}>
            <label htmlFor="job-select" style={{ fontWeight: 'bold', marginRight: 8 }}>Select Job Role:</label>
            <select
              id="job-select"
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '1rem' }}
            >
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="filter-select" style={{ fontWeight: 'bold', marginRight: 8 }}>Filter by Experience:</label>
            <select
              id="filter-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '1rem' }}
            >
              {experienceFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <h2>Applications</h2>
          {loadingApps ? (
            <p>Loading applications...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Applicant Name</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Experience</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Resume</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Cover Letter</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Applied Date</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredApplications().length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No applications found for this job.</td></tr>
                  ) : (
                    getFilteredApplications().map(app => {
                      const candidate = app.userId || {};
                      // Extract experience for display
                      let expDisplay = '0';
                      const experience = candidate.profile?.experience;
                      
                      if (Array.isArray(experience) && experience.length > 0) {
                        expDisplay = experience[0] || '0';
                      } else if (experience) {
                        expDisplay = experience.toString();
                      }
                      
                      // Format applied date
                      const appliedDate = new Date(app.appliedAt).toLocaleDateString();
                      
                      return (
                        <tr key={app._id} style={{ backgroundColor: '#fff' }}>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: '500' }}>
                            {app.applicantName || candidate.name || 'N/A'}
                          </td>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                            {app.applicantEmail || candidate.email || 'N/A'}
                          </td>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                            {expDisplay} years
                          </td>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                            {app.resumeFileName ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#10b981' }}>📄</span>
                                <a 
                                  href={`${API_BASE_URL}/${app.resumePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#3b82f6', 
                                    textDecoration: 'none',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {app.resumeFileName}
                                </a>
                              </div>
                            ) : (
                              <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.875rem' }}>
                                No resume
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', maxWidth: '200px' }}>
                            {app.coverLetter ? (
                              <div style={{ 
                                maxHeight: '60px', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                color: '#3b82f6'
                              }} 
                              title={app.coverLetter}
                              onClick={() => alert(app.coverLetter)}
                              >
                                {app.coverLetter.length > 50 ? app.coverLetter.substring(0, 50) + '...' : app.coverLetter}
                              </div>
                            ) : (
                              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No cover letter</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', color: '#6b7280' }}>
                            {appliedDate}
                          </td>
                          <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              backgroundColor: app.stage === 'Resume Screening' ? '#fef3c7' : 
                                             app.stage === 'Interview' ? '#dbeafe' : 
                                             app.stage === 'Hired' ? '#d1fae5' : '#f3f4f6',
                              color: app.stage === 'Resume Screening' ? '#92400e' : 
                                     app.stage === 'Interview' ? '#1e40af' : 
                                     app.stage === 'Hired' ? '#065f46' : '#374151'
                            }}>
                              {app.stage || 'Resume Screening'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecruiterDashboard; 