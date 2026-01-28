import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBriefcaseOutline, IoLocationOutline, IoTimeOutline, IoStarOutline, IoCloudUploadOutline, IoDocumentTextOutline, IoSparklesOutline } from 'react-icons/io5';
import { API_ENDPOINTS } from '../../config/api';
import { makeAuthenticatedRequest } from '../../utils/apiUtils';

const BrowseJobs = () => {
  // Add CSS animation for spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploadedResume, setUploadedResume] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs from:', API_ENDPOINTS.JOBS);
      const response = await fetch(API_ENDPOINTS.JOBS);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Jobs data received:', data);
      
      if (data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        console.log('Jobs set successfully:', data.jobs.length, 'jobs');
      } else {
        console.error('Invalid data structure:', data);
        setError('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(`Failed to load jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setResumeUploading(true);
    setUploadedResume(file);

    // Simulate resume processing and job recommendation
    setTimeout(() => {
      generateRecommendations(file);
      setResumeUploading(false);
    }, 2000);
  };

  // Try to get backend recommendations first, fallback to frontend logic
  const getBackendRecommendations = async () => {
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.JOB_RECOMMENDATIONS);
      const data = await response.json();
      
      if (data.success && data.recommendations.length > 0) {
        console.log('Backend recommendations received:', data.recommendations);
        return data.recommendations.slice(0, 6);
      }
    } catch (error) {
      console.log('Backend recommendations not available:', error.message);
    }
    return null;
  };

  const generateRecommendations = async (resumeFile) => {
    // Try backend recommendations first
    const backendRecommendations = await getBackendRecommendations();
    
    if (backendRecommendations) {
      setRecommendedJobs(backendRecommendations);
      setShowRecommendations(true);
      return;
    }

    // Fallback to frontend logic if backend is not available or user not authenticated
    console.log('Using frontend recommendation logic based on filename');
    const fileName = resumeFile.name.toLowerCase();
    let recommendedJobsData = [];

    if (fileName.includes('developer') || fileName.includes('engineer') || fileName.includes('tech')) {
      recommendedJobsData = jobs.filter(job => 
        job.title.toLowerCase().includes('developer') || 
        job.title.toLowerCase().includes('engineer') ||
        job.title.toLowerCase().includes('software')
      ).slice(0, 6);
    } else if (fileName.includes('marketing') || fileName.includes('sales')) {
      recommendedJobsData = jobs.filter(job => 
        job.title.toLowerCase().includes('marketing') || 
        job.title.toLowerCase().includes('sales')
      ).slice(0, 6);
    } else if (fileName.includes('design') || fileName.includes('ui') || fileName.includes('ux')) {
      recommendedJobsData = jobs.filter(job => 
        job.title.toLowerCase().includes('design') || 
        job.title.toLowerCase().includes('ui') ||
        job.title.toLowerCase().includes('ux')
      ).slice(0, 6);
    } else {
      // Default recommendations - pick random jobs
      const shuffled = [...jobs].sort(() => 0.5 - Math.random());
      recommendedJobsData = shuffled.slice(0, 6);
    }

    setRecommendedJobs(recommendedJobsData);
    setShowRecommendations(true);
  };

  const clearResumeAndRecommendations = () => {
    setUploadedResume(null);
    setRecommendedJobs([]);
    setShowRecommendations(false);
  };

  const handleApplyToJob = async (jobId) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to apply for jobs');
        navigate('/login');
        return;
      }

      // Check if already applied
      if (appliedJobs.has(jobId)) {
        alert('You have already applied to this job');
        return;
      }

      // Set applying state
      setApplyingJobs(prev => new Set([...prev, jobId]));

      const response = await makeAuthenticatedRequest(API_ENDPOINTS.APPLY, {
        method: 'POST',
        body: JSON.stringify({ jobId })
      });

      const data = await response.json();

      if (data.success) {
        // Mark as applied
        setAppliedJobs(prev => new Set([...prev, jobId]));
        alert('Application submitted successfully!');
      } else {
        alert(data.message || 'Failed to apply for job');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      if (error.message === 'No authentication token found') {
        alert('Please login to apply for jobs');
        navigate('/login');
      } else {
        alert('Failed to apply for job. Please try again.');
      }
    } finally {
      // Remove from applying state
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    try {
      const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (job.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle location as object or string
      const locationString = typeof job.location === 'object' 
        ? `${job.location?.city || ''} ${job.location?.country || ''}`.trim()
        : (job.location || '');
      const matchesLocation = !locationFilter || locationString.toLowerCase().includes(locationFilter.toLowerCase());
      
      // Handle job type safely
      const jobType = Array.isArray(job.type) ? job.type.join(' ') : (job.type || '');
      const matchesType = !typeFilter || jobType.toLowerCase().includes(typeFilter.toLowerCase());
      
      return matchesSearch && matchesLocation && matchesType;
    } catch (error) {
      console.error('Error filtering job:', job, error);
      return false;
    }
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '1rem' }}>Loading jobs...</div>
        <div style={{ fontSize: '0.875rem' }}>Fetching from: {API_ENDPOINTS.JOBS}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#ef4444',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1rem' }}>❌ {error}</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          API Endpoint: {API_ENDPOINTS.JOBS}
        </div>
        <button 
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchJobs();
          }}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>Browse Jobs</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Discover amazing opportunities that match your interests</p>
      </div>

      {/* Resume Upload Section */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '2px dashed #0ea5e9',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <IoSparklesOutline style={{ fontSize: '3rem', color: '#0ea5e9', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
            Get Personalized Job Recommendations
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Upload your resume to get AI-powered job recommendations tailored to your skills and experience
          </p>
        </div>

        {!uploadedResume ? (
          <div>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="resume-upload"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                border: 'none',
                transition: 'background-color 0.2s'
              }}
            >
              <IoCloudUploadOutline />
              Upload Resume (PDF, DOC, DOCX)
            </label>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Maximum file size: 5MB
            </p>
          </div>
        ) : (
          <div>
            {resumeUploading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0ea5e9',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#0ea5e9', fontWeight: '500' }}>Analyzing your resume...</span>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <IoDocumentTextOutline style={{ color: '#059669' }} />
                  <span style={{ color: '#059669', fontWeight: '500' }}>
                    Resume uploaded: {uploadedResume.name}
                  </span>
                </div>
                <button
                  onClick={clearResumeAndRecommendations}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove Resume
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'end'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Search Jobs
          </label>
          <input
            type="text"
            placeholder="Search by job title, company, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Location
          </label>
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          // addding slider for selection range of salary
          
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Job Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="">All Types</option>
            <option value="full time">Full Time</option>
            <option value="part time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      {showRecommendations && recommendedJobs.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #10b981'
          }}>
            <IoSparklesOutline style={{ color: '#10b981', fontSize: '1.5rem' }} />
            <h2 style={{ fontSize: '1.75rem', color: '#1f2937', margin: 0 }}>
              Recommended Jobs Based on Your Resume
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {recommendedJobs.map((job) => (
              <div key={`rec-${job._id}`} style={{
                backgroundColor: '#fff',
                border: '2px solid #10b981',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {job.matchPercentage ? `${job.matchPercentage}% MATCH` : 'RECOMMENDED'}
                </div>
                
                <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>
                    {job.title}
                  </h3>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    {job.company}
                  </p>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <IoLocationOutline />
                    <span>
                      {typeof job.location === 'object' 
                        ? `${job.location.city || ''}, ${job.location.country || ''}`.replace(/^,\s*|,\s*$/g, '')
                        : job.location || 'Location not specified'
                      }
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <IoTimeOutline />
                    <span>{Array.isArray(job.type) ? job.type.join(', ') : (job.type || 'Not specified')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <IoStarOutline />
                    <span>
                      {typeof job.salary === 'object' && job.salary?.min && job.salary?.max
                        ? `$${job.salary.min} - $${job.salary.max}`
                        : job.salary || 'Salary not specified'
                      }
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ 
                    color: '#374151',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          borderRadius: '12px',
                          fontSize: '0.875rem'
                        }}>
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          borderRadius: '12px',
                          fontSize: '0.875rem'
                        }}>
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => handleApplyToJob(job._id)}
                  disabled={applyingJobs.has(job._id) || appliedJobs.has(job._id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: appliedJobs.has(job._id) ? '#6b7280' : 
                                   applyingJobs.has(job._id) ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: appliedJobs.has(job._id) || applyingJobs.has(job._id) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: appliedJobs.has(job._id) || applyingJobs.has(job._id) ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!appliedJobs.has(job._id) && !applyingJobs.has(job._id)) {
                      e.target.style.backgroundColor = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!appliedJobs.has(job._id) && !applyingJobs.has(job._id)) {
                      e.target.style.backgroundColor = '#10b981';
                    }
                  }}
                >
                  {appliedJobs.has(job._id) ? '✓ Applied' : 
                   applyingJobs.has(job._id) ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Jobs Section */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', color: '#1f2937' }}>
          {showRecommendations ? 'All Available Jobs' : 'Available Jobs'}
        </h2>
      </div>

      {/* Jobs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {filteredJobs.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '3rem',
            color: '#6b7280'
          }}>
            <IoBriefcaseOutline style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {job.title}
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  {job.company}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <IoLocationOutline />
                  <span>
                    {typeof job.location === 'object' 
                      ? `${job.location.city || ''}, ${job.location.country || ''}`.replace(/^,\s*|,\s*$/g, '')
                      : job.location || 'Location not specified'
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <IoTimeOutline />
                  <span>{Array.isArray(job.type) ? job.type.join(', ') : (job.type || 'Not specified')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <IoStarOutline />
                  <span>
                    {typeof job.salary === 'object' && job.salary?.min && job.salary?.max
                      ? `$${job.salary.min} - $${job.salary.max}`
                      : job.salary || 'Salary not specified'
                    }
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ 
                  color: '#374151',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {job.description}
                </p>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                      }}>
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                      }}>
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={() => handleApplyToJob(job._id)}
                disabled={applyingJobs.has(job._id) || appliedJobs.has(job._id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: appliedJobs.has(job._id) ? '#6b7280' : 
                                 applyingJobs.has(job._id) ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: appliedJobs.has(job._id) || applyingJobs.has(job._id) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: appliedJobs.has(job._id) || applyingJobs.has(job._id) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!appliedJobs.has(job._id) && !applyingJobs.has(job._id)) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!appliedJobs.has(job._id) && !applyingJobs.has(job._id)) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {appliedJobs.has(job._id) ? '✓ Applied' : 
                 applyingJobs.has(job._id) ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowseJobs;
