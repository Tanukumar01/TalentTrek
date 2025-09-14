import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoBriefcaseOutline, IoLocationOutline, IoTimeOutline, IoStarOutline, IoCloudUploadOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import './JobRecommendations.css';
import { API_ENDPOINTS } from '../../config/api';

const JobRecommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.JOB_RECOMMENDATIONS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
        setUserSkills(data.userSkills);
        setHasResume(data.recommendations.length > 0 || data.message === 'No resume uploaded yet');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load job recommendations');
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
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (minimum 100KB, maximum 5MB)
    const minSize = 100 * 1024; // 100KB in bytes
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    
    if (file.size < minSize) {
      toast.error('File size must be at least 100KB');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
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
        toast.success('Resume uploaded successfully!');
        setUserSkills(data.parsedData.skills);
        setHasResume(true);
        // Refresh recommendations
        await fetchRecommendations();
      } else {
        toast.error(data.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Yellow
    if (percentage >= 40) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your personalized job recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1>Job Recommendations</h1>
        <p>Personalized job matches based on your resume</p>
      </div>

      {!hasResume ? (
        <div className="upload-section">
          <div className="upload-card">
            <IoCloudUploadOutline className="upload-icon" />
            <h2>Upload Your Resume</h2>
            <p>Upload your resume to get personalized job recommendations based on your skills and experience.</p>
            <label className="upload-btn">
              <IoCloudUploadOutline />
              {uploading ? 'Uploading...' : 'Choose Resume'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <div className="upload-info">
              <p>Supported formats: PDF, DOC, DOCX</p>
              <p>File size: 100KB - 5MB</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {userSkills.length > 0 && (
            <div className="skills-section">
              <h3>Skills from your resume:</h3>
              <div className="skills-list">
                {userSkills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    <IoCheckmarkCircleOutline />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-header">
                    <div className="job-title-section">
                      <h3>{job.title}</h3>
                      <p className="company">{job.company}</p>
                    </div>
                    <div className="match-badge" style={{ backgroundColor: getMatchColor(job.matchPercentage) }}>
                      {job.matchPercentage}% Match
                    </div>
                  </div>
                  
                  <div className="job-details">
                    <div className="detail-item">
                      <IoLocationOutline />
                      <span>{job.location}</span>
                    </div>
                    <div className="detail-item">
                      <IoTimeOutline />
                      <span>{job.type}</span>
                    </div>
                    <div className="detail-item">
                      <IoBriefcaseOutline />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="job-description">
                    <p>{job.description.substring(0, 150)}...</p>
                  </div>

                  <div className="job-skills">
                    <h4>Required Skills:</h4>
                    <div className="skills-tags">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span 
                          key={index} 
                          className={`skill-tag ${userSkills.includes(skill) ? 'matched' : ''}`}
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="skill-tag more">+{job.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>

                  <div className="job-actions">
                    <button 
                      className="apply-btn"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    >
                      View & Apply
                    </button>
                    <button className="save-btn">Save Job</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-recommendations">
              <IoBriefcaseOutline className="no-jobs-icon" />
              <h3>No recommendations yet</h3>
              <p>We're working on finding the perfect jobs for you. Check back soon!</p>
            </div>
          )}

          <div className="upload-new-section">
            <h3>Want better recommendations?</h3>
            <p>Upload a new resume to get more accurate job matches</p>
            <label className="upload-new-btn">
              <IoCloudUploadOutline />
              Upload New Resume
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default JobRecommendations; 