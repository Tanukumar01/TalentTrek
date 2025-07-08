import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IoPersonOutline, IoBriefcaseOutline, IoMailOutline, IoPhonePortraitOutline, IoLocationOutline, IoAddOutline, IoTrashOutline, IoDownloadOutline, IoCloudUploadOutline } from 'react-icons/io5';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      location: '',
      dateOfBirth: '',
      bio: '',
      profilePicture: null
    },
    professional: {
      title: '',
      company: '',
      industry: '',
      yearsOfExperience: '',
      skills: [],
      linkedin: '',
      website: ''
    },
    experience: [],
    education: [],
    resume: null
  });

  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: ''
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsEditing(false);
  };

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (type === 'profilePicture') {
        const reader = new FileReader();
        reader.onload = (e) => {
          handleInputChange('personal', 'profilePicture', e.target.result);
        };
        reader.readAsDataURL(file);
      } else if (type === 'resume') {
        handleInputChange('resume', null, file);
      }
    }
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setProfileData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience, id: Date.now() }]
      }));
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
    }
  };

  const removeExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setProfileData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, id: Date.now() }]
      }));
      setNewEducation({
        degree: '',
        institution: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: ''
      });
    }
  };

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        professional: {
          ...prev.professional,
          skills: [...prev.professional.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        skills: prev.professional.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const downloadResume = () => {
    if (profileData.resume) {
      const url = URL.createObjectURL(profileData.resume);
      const a = document.createElement('a');
      a.href = url;
      a.download = profileData.resume.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your personal and professional information</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {profileData.personal.profilePicture ? (
                <img src={profileData.personal.profilePicture} alt="Profile" />
              ) : (
                <IoPersonOutline className="default-avatar" />
              )}
            </div>
            {isEditing && (
              <label className="upload-picture-btn">
                <IoCloudUploadOutline />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'profilePicture')}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <IoPersonOutline />
              Personal Details
            </button>
            <button
              className={`tab ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              <IoBriefcaseOutline />
              Professional Info
            </button>
            <button
              className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <IoBriefcaseOutline />
              Experience
            </button>
            <button
              className={`tab ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <IoBriefcaseOutline />
              Education
            </button>
            <button
              className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <IoDownloadOutline />
              Resume
            </button>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-actions">
            {isEditing ? (
              <div className="action-buttons">
                <button className="btn-save" onClick={saveProfile}>
                  Save Changes
                </button>
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {/* Personal Details Tab */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <h2>Personal Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={profileData.personal.firstName}
                    onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={profileData.personal.lastName}
                    onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.personal.email}
                    onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileData.personal.phone}
                    onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profileData.personal.location}
                    onChange={(e) => handleInputChange('personal', 'location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your location"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.personal.dateOfBirth}
                    onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  value={profileData.personal.bio}
                  onChange={(e) => handleInputChange('personal', 'bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* Professional Info Tab */}
          {activeTab === 'professional' && (
            <div className="tab-content">
              <h2>Professional Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={profileData.professional.title}
                    onChange={(e) => handleInputChange('professional', 'title', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={profileData.professional.company}
                    onChange={(e) => handleInputChange('professional', 'company', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your company"
                  />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={profileData.professional.industry}
                    onChange={(e) => handleInputChange('professional', 'industry', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Technology"
                  />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    value={profileData.professional.yearsOfExperience}
                    onChange={(e) => handleInputChange('professional', 'yearsOfExperience', e.target.value)}
                    disabled={!isEditing}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.professional.linkedin}
                    onChange={(e) => handleInputChange('professional', 'linkedin', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profileData.professional.website}
                    onChange={(e) => handleInputChange('professional', 'website', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="skills-section">
                <label>Skills</label>
                <div className="skills-input">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  {isEditing && (
                    <button className="btn-add-skill" onClick={addSkill}>
                      <IoAddOutline />
                    </button>
                  )}
                </div>
                <div className="skills-list">
                  {profileData.professional.skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="remove-skill">
                          <IoTrashOutline />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="tab-content">
              <h2>Work Experience</h2>
              
              {isEditing && (
                <div className="add-experience-form">
                  <h3>Add New Experience</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                        placeholder="e.g., Senior Developer"
                      />
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                        disabled={newExperience.current}
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newExperience.current}
                          onChange={(e) => setNewExperience({...newExperience, current: e.target.checked})}
                        />
                        I currently work here
                      </label>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                      placeholder="Describe your role and achievements..."
                      rows="3"
                    />
                  </div>
                  <button className="btn-add" onClick={addExperience}>
                    <IoAddOutline />
                    Add Experience
                  </button>
                </div>
              )}

              <div className="experience-list">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="experience-item">
                    <div className="experience-header">
                      <h4>{exp.title}</h4>
                      {isEditing && (
                        <button onClick={() => removeExperience(exp.id)} className="btn-remove">
                          <IoTrashOutline />
                        </button>
                      )}
                    </div>
                    <p className="company">{exp.company}</p>
                    <p className="duration">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                    <p className="location">{exp.location}</p>
                    <p className="description">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="tab-content">
              <h2>Education</h2>
              
              {isEditing && (
                <div className="add-education-form">
                  <h3>Add New Education</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                        placeholder="e.g., Bachelor of Science"
                      />
                    </div>
                    <div className="form-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                        placeholder="University name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Field of Study</label>
                      <input
                        type="text"
                        value={newEducation.field}
                        onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={newEducation.startDate}
                        onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={newEducation.endDate}
                        onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                        disabled={newEducation.current}
                      />
                    </div>
                    <div className="form-group">
                      <label>GPA</label>
                      <input
                        type="text"
                        value={newEducation.gpa}
                        onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                        placeholder="e.g., 3.8/4.0"
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={newEducation.current}
                          onChange={(e) => setNewEducation({...newEducation, current: e.target.checked})}
                        />
                        I'm currently studying here
                      </label>
                    </div>
                  </div>
                  <button className="btn-add" onClick={addEducation}>
                    <IoAddOutline />
                    Add Education
                  </button>
                </div>
              )}

              <div className="education-list">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="education-item">
                    <div className="education-header">
                      <h4>{edu.degree}</h4>
                      {isEditing && (
                        <button onClick={() => removeEducation(edu.id)} className="btn-remove">
                          <IoTrashOutline />
                        </button>
                      )}
                    </div>
                    <p className="institution">{edu.institution}</p>
                    <p className="field">{edu.field}</p>
                    <p className="duration">
                      {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    </p>
                    {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === 'resume' && (
            <div className="tab-content">
              <h2>Resume</h2>
              
              <div className="resume-section">
                {profileData.resume ? (
                  <div className="resume-info">
                    <div className="resume-details">
                      <h3>{profileData.resume.name}</h3>
                      <p>Size: {(profileData.resume.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Type: {profileData.resume.type}</p>
                    </div>
                    <div className="resume-actions">
                      <button className="btn-download" onClick={downloadResume}>
                        <IoDownloadOutline />
                        Download
                      </button>
                      {isEditing && (
                        <label className="btn-upload">
                          <IoCloudUploadOutline />
                          Replace
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileUpload(e, 'resume')}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-resume">
                    <IoCloudUploadOutline className="upload-icon" />
                    <h3>No Resume Uploaded</h3>
                    <p>Upload your resume to make your profile more attractive to employers</p>
                    {isEditing && (
                      <label className="btn-upload-resume">
                        <IoCloudUploadOutline />
                        Upload Resume
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 