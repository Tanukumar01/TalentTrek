import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import { 
  IoLocationOutline, 
  IoTimeOutline, 
  IoCashOutline, 
  IoGlobeOutline,
  IoArrowBackOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoBriefcaseOutline,
  IoStarOutline
} from 'react-icons/io5';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log('Fetching job with ID:', id);
        const response = await fetch(`${API_ENDPOINTS.JOBS}/${id}`);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        if (data.success) {
          setJob(data.job);
        } else {
          setError(data.message || 'Failed to fetch job');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    const checkApplicationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // User not logged in
        
        const response = await fetch(API_ENDPOINTS.CHECK_APPLICATION(id), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setApplied(data.hasApplied);
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    if (id) {
      fetchJob();
      checkApplicationStatus();
    } else {
      setError('No job ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (maximum 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.UPLOAD_RESUME, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setResumeFile(file);
        setResumeUploaded(true);
        setError(null);
      } else {
        setError(data.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setError('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeUploaded(false);
    // Reset the file input
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to apply for this job');
        setSubmitting(false);
        return;
      }

      // Validate form data
      if (!form.name.trim()) {
        setError('Please enter your name');
        setSubmitting(false);
        return;
      }
      if (!form.email.trim()) {
        setError('Please enter your email');
        setSubmitting(false);
        return;
      }

      // Create FormData for application with optional resume
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('name', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('message', form.message.trim());
      
      // Add resume file if uploaded
      if (resumeUploaded && resumeFile) {
        formData.append('resume', resumeFile);
      }

      const response = await fetch(API_ENDPOINTS.APPLY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setApplied(true);
        setForm({ name: '', email: '', message: '' }); // Clear form
      } else {
        setError(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Application error:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      fontSize: '1.2rem',
      color: '#6b7280'
    }}>
      Loading job details...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ 
        color: '#ef4444', 
        backgroundColor: '#fef2f2',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        marginBottom: '1rem'
      }}>
        <h2>Error Loading Job</h2>
        <p>{error}</p>
      </div>
      <button 
        onClick={() => navigate('/browse-jobs')}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Browse Jobs
      </button>
    </div>
  );
  
  if (!job) return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ 
        color: '#6b7280', 
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem'
      }}>
        <h2>Job Not Found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
      </div>
      <button 
        onClick={() => navigate('/browse-jobs')}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Browse Jobs
      </button>
    </div>
  );

  console.log('Rendering JobDetail component with job:', job);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '1rem 0'
    }}>
      <div className="job-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.target.style.color = '#374151'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <IoArrowBackOutline size={16} />
          Back to Jobs
        </button>

        {/* Job Header Card */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.25rem',
          marginBottom: '1rem',
          border: '1px solid #f1f5f9'
        }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.25rem',
            lineHeight: '1.2'
          }}>
            {job.title}
          </h1>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ 
              fontSize: '0.9375rem',
              color: '#374151',
              fontWeight: '400'
            }}>
              {job.company}
            </span>
            {job.companyWebsite && (
              <a 
                href={job.companyWebsite} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: '#0ea5e9',
                  textDecoration: 'none',
                  fontSize: '0.8125rem'
                }}
              >
                {job.companyWebsite}
              </a>
            )}
          </div>

          {/* Job Info Cards */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            {/* Location Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#dbeafe',
              borderRadius: '8px',
              fontSize: '0.875rem',
              border: '1px solid #93c5fd'
            }}>
              <IoLocationOutline size={16} style={{ color: '#3b82f6' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: '500', lineHeight: '1' }}>Location</p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, fontWeight: '600', lineHeight: '1.2' }}>
                  {typeof job.location === 'object'
                    ? `${job.location.city || ''}, ${job.location.country || ''}`.replace(/^,\s*|,\s*$/g, '')
                    : job.location || 'Not specified'
                  }
                </p>
              </div>
            </div>

            {/* Type Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#dbeafe',
              borderRadius: '8px',
              fontSize: '0.875rem',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#3b82f6',
                borderRadius: '2px'
              }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: '500', lineHeight: '1' }}>Type</p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, fontWeight: '600', lineHeight: '1.2' }}>
                  {Array.isArray(job.type) ? job.type.join(', ') : (job.type || 'Not specified')}
                </p>
              </div>
            </div>

            {/* Salary Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#d1fae5',
              borderRadius: '8px',
              fontSize: '0.875rem',
              border: '1px solid #a7f3d0'
            }}>
              <IoCashOutline size={16} style={{ color: '#10b981' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, fontWeight: '500', lineHeight: '1' }}>Salary</p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, fontWeight: '600', lineHeight: '1.2' }}>
                  {typeof job.salary === 'object' && job.salary?.min && job.salary?.max
                    ? `$${job.salary.min} - $${job.salary.max}`
                    : job.salary || 'Not specified'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
          gap: '1rem',
        },
      }}>

        {/* Left Column - Job Description */}
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Job Description Section */}
          <div style={{ 
            padding: '1rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.625rem' 
            }}>
              <IoDocumentTextOutline size={14} style={{ color: '#3b82f6' }} />
              <h2 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Job Description
              </h2>
            </div>
            <div style={{
              fontSize: '0.8125rem',
              lineHeight: '1.5',
              color: '#4b5563',
              whiteSpace: 'pre-wrap'
            }}>
              {job.description}
            </div>
          </div>

          {/* Requirements Section */}
          <div style={{ 
            padding: '1rem',
            borderBottom: job.skills && job.skills.length > 0 ? '1px solid #f1f5f9' : 'none'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.625rem' 
            }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontSize: '0.5625rem', fontWeight: 'bold' }}>R</span>
              </div>
              <h2 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Requirements
              </h2>
            </div>
            <div style={{
              fontSize: '0.8125rem',
              lineHeight: '1.5',
              color: '#4b5563'
            }}>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1rem',
                listStyleType: 'disc'
              }}>
                {job.requirements && job.requirements.split('\n').filter(req => req.trim()).map((requirement, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {requirement.replace(/^[•\-\*]\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Section */}
          {job.skills && job.skills.length > 0 && (
            <div style={{ padding: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.625rem' 
              }}>
                <IoStarOutline size={14} style={{ color: '#3b82f6' }} />
                <h2 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Required Skills
                </h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {job.skills.map((skill, index) => (
                  <span key={index} style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#f1f5f9',
                    color: '#374151',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    border: '1px solid #e2e8f0'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Apply Form */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1rem',
          height: 'fit-content',
          position: 'sticky',
          top: '0rem'
        }}>
          <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.625rem' 
            }}>
              <IoCheckmarkCircleOutline size={14} style={{ color: '#3b82f6' }} />
              <h2 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Apply for this job
              </h2>
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Submit your application below
            </p>
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {applied ? (
            <div style={{
              color: '#10b981',
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              ✅ You have already applied for this position! The recruiter will review your application.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Name Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.375rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  fontSize: '0.8125rem'
                }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Email Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.375rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  fontSize: '0.8125rem'
                }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Cover Letter Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.375rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  fontSize: '0.8125rem'
                }}>
                  Cover Letter <span style={{ color: '#9ca3af' }}>(Optional)</span>
                </label>
                <textarea
                  name="message"
                  placeholder="Tell the recruiter why you're interested in this position..."
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.375rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  fontSize: '0.8125rem'
                }}>
                  Resume <span style={{ color: '#9ca3af' }}>(Optional)</span>
                </label>
                {!resumeUploaded ? (
                  <div style={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: '6px',
                    padding: '1rem',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                  }}>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={submitting || uploading}
                      style={{ display: 'none' }}
                    />
                    <IoCloudUploadOutline 
                      size={20} 
                      style={{ 
                        color: '#6b7280', 
                        marginBottom: '0.375rem',
                        display: 'block',
                        margin: '0 auto 0.375rem auto'
                      }} 
                    />
                    <label
                      htmlFor="resume-upload"
                      style={{
                        display: 'block',
                        color: '#374151',
                        fontSize: '0.8125rem',
                        fontWeight: '500',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Resume'}
                    </label>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#9ca3af',
                      margin: 0
                    }}>
                      PDF, DOC or DOCX (max 5MB)
                    </p>
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    padding: '0.625rem',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <IoCheckmarkCircleOutline size={16} style={{ color: '#10b981' }} />
                      <span style={{ color: '#065f46', fontWeight: '500', fontSize: '0.8125rem' }}>
                        {resumeFile?.name || 'Resume uploaded'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeResume}
                      disabled={submitting}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || applied}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: applied ? '#10b981' : (submitting ? '#9ca3af' : '#3b82f6'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: (submitting || applied) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  width: '100%',
                  textTransform: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && !applied) e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  if (!submitting && !applied) e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                {applied ? '✅ Already Applied' : (submitting ? 'Submitting Application...' : 'Submit Application')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Mobile Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .job-detail-container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
    </div>
  );
};

export default JobDetail;