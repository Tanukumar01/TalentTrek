import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';

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
    if (id) {
      fetchJob();
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

      // Get resume path from user's profile if resume was uploaded
      let resumePath = '';
      let resumeFileName = '';
      
      if (resumeUploaded && resumeFile) {
        // Get the latest resume from user's profile
        try {
          const userResponse = await fetch(`${API_BASE_URL}/api/protected`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userResponse.json();
          if (userData.user && userData.user.profile && userData.user.profile.resumePath) {
            resumePath = userData.user.profile.resumePath;
            resumeFileName = resumeFile.name;
          }
        } catch (err) {
          console.log('Could not fetch user resume info');
        }
      }

      const response = await fetch(API_ENDPOINTS.APPLY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          jobId: id,
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          resumePath: resumePath,
          resumeFileName: resumeFileName
        })
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
        onClick={() => navigate('/job-recommendations')}
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
        Back to Job Recommendations
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
        onClick={() => navigate('/job-recommendations')}
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
        Back to Job Recommendations
      </button>
    </div>
  );

  console.log('Rendering JobDetail component with job:', job);
  
  return (
    <div className="job-detail-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#374151'
        }}
      >
        ← Back to Jobs
      </button>
      <div className="job-header" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1f2937' }}>{job.title}</h1>
        <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '1rem' }}>{job.company}</p>
        {job.companyWebsite && (
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Website:</strong> <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>{job.companyWebsite}</a>
          </p>
        )}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <p><strong>📍 Location:</strong> {job.location}</p>
          <p><strong>⏰ Type:</strong> {job.type}</p>
          <p><strong>💰 Salary:</strong> {job.salary}</p>
        </div>
      </div>

      <div className="job-content" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>Job Description</h2>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '6px', 
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {job.description}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>Requirements</h2>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '6px', 
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {job.requirements}
          </div>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>Required Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {job.skills.map((skill, index) => (
                <span key={index} style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="application-section" style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>Apply for this job</h2>
        {error && <div style={{color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca'}}>{error}</div>}
        {applied ? (
          <div style={{color: '#10b981', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0'}}>
            ✅ Application submitted successfully! The recruiter will review your application.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500}}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Your Name *</label>
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
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Your Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                required
                disabled={submitting}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Cover Letter (Optional)</label>
              <textarea
                name="message"
                placeholder="Tell the recruiter why you're interested in this position..."
                value={form.message}
                onChange={handleChange}
                rows={4}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Resume (Optional)
              </label>
              {!resumeUploaded ? (
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '6px',
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb'
                }}>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={submitting || uploading}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="resume-upload"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {uploading ? 'Uploading...' : '📄 Upload Resume'}
                  </label>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    PDF, DOC, or DOCX (max 5MB)
                  </p>
                </div>
              ) : (
                <div style={{
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>✅</span>
                    <span style={{ color: '#065f46', fontWeight: '500' }}>
                      {resumeFile.name}
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
                      fontSize: '0.875rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobDetail; 