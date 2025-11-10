import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IoPersonOutline, IoBriefcaseOutline, IoAddOutline, IoTrashOutline, IoDownloadOutline, IoCloudUploadOutline, IoBusinessOutline, IoGlobeOutline, IoLogoLinkedin, IoCheckmarkCircleOutline, IoStarOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { API_ENDPOINTS } from '../../config/api';
import { makeAuthenticatedRequest, getCurrentUser } from '../../utils/apiUtils';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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
      title: user?.role === 'recruiter' ? 'Talent Acquisition Specialist' : '',
      company: '',
      industry: user?.role === 'recruiter' ? 'Human Resources' : '',
      yearsOfExperience: '',
      skills: user?.role === 'recruiter' ? ['Talent Acquisition', 'Interviewing', 'HR Management'] : [],
      linkedin: '',
      website: ''
    },
    experience: [],
    education: [],
    resume: null,
    recruiterStats: user?.role === 'recruiter' ? {
      jobsPosted: 0,
      candidatesHired: 0,
      activeJobs: 0,
      successRate: 0
    } : undefined
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
    loadUserProfile();
  }, [user]); // Reload when user changes

  const loadUserProfile = async () => {
    console.log('🔄 Loading user profile...');
    try {
      // Check if user is authenticated via AuthContext first
      if (!user) {
        console.error('❌ No user in AuthContext');
        console.log('🔧 Initializing with default profile data');
        initializeDefaultProfile();
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      console.log('👤 Current user from localStorage:', currentUser);
      console.log('👤 User from AuthContext:', user);
      
      // Use AuthContext user if getCurrentUser fails
      const userToUse = currentUser || user;
      
      if (!userToUse) {
        console.error('❌ No authenticated user found in either source');
        console.log('🔧 Initializing with default profile data');
        initializeDefaultProfile();
        setLoading(false);
        return;
      }

      // Try to load from API first, but don't fail if it doesn't work
      try {
        console.log('📡 Making API request to:', API_ENDPOINTS.USER_PROFILE);
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USER_PROFILE);
        console.log('📥 API response status:', response.status);
        
        const data = await response.json();
        console.log('📄 API response data:', data);
      
      if (data.success && data.user) {
        // Map backend user data to frontend profile structure
        const backendProfile = data.user.profile || {};
        
        setProfileData({
          personal: {
            firstName: backendProfile.firstName || '',
            lastName: backendProfile.lastName || '',
            email: data.user.email || '',
            phone: backendProfile.phone || '',
            location: backendProfile.address?.city || '',
            dateOfBirth: backendProfile.dateOfBirth || '',
            bio: backendProfile.jobSeekerProfile?.bio || backendProfile.recruiterProfile?.bio || '',
            profilePicture: backendProfile.profilePicture || null
          },
          professional: {
            title: user?.role === 'recruiter' ? backendProfile.recruiterProfile?.position || 'Talent Acquisition Specialist' : '',
            company: backendProfile.recruiterProfile?.companyName || '',
            industry: backendProfile.recruiterProfile?.industry || (user?.role === 'recruiter' ? 'Human Resources' : ''),
            yearsOfExperience: backendProfile.recruiterProfile?.yearsOfExperience || '',
            skills: backendProfile.jobSeekerProfile?.skills || (user?.role === 'recruiter' ? ['Talent Acquisition', 'Interviewing', 'HR Management'] : []),
            linkedin: backendProfile.socialLinks?.linkedin || '',
            website: backendProfile.socialLinks?.portfolio || ''
          },
          experience: backendProfile.jobSeekerProfile?.experience || [],
          education: backendProfile.jobSeekerProfile?.education || [],
          resume: backendProfile.jobSeekerProfile?.resumePath || null,
          recruiterStats: user?.role === 'recruiter' ? {
            jobsPosted: 0,
            candidatesHired: 0,
            activeJobs: 0,
            successRate: 0
          } : undefined
        });
        console.log('✅ Profile data loaded successfully');
      } else {
        console.warn('⚠️ API call succeeded but no user data returned');
        // Initialize with default data
        initializeDefaultProfile();
      }
      } catch (apiError) {
        console.warn('⚠️ API call failed, using fallback data:', apiError.message);
        initializeDefaultProfile();
      }
      
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Fallback to localStorage if API fails
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        console.log('📦 Loading profile from localStorage');
        setProfileData(JSON.parse(savedProfile));
      } else {
        console.log('🔧 Initializing with default profile data');
        initializeDefaultProfile();
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultProfile = () => {
    setProfileData({
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
        title: user?.role === 'recruiter' ? 'Talent Acquisition Specialist' : '',
        company: '',
        industry: user?.role === 'recruiter' ? 'Human Resources' : '',
        yearsOfExperience: '',
        skills: user?.role === 'recruiter' ? ['Talent Acquisition', 'Interviewing', 'HR Management'] : [],
        linkedin: '',
        website: ''
      },
      experience: [],
      education: [],
      resume: null,
      recruiterStats: user?.role === 'recruiter' ? {
        jobsPosted: 0,
        candidatesHired: 0,
        activeJobs: 0,
        successRate: 0
      } : undefined
    });
  };

  const validateProfileData = () => {
    const errors = [];
    
    // Basic validation for required fields (relaxed for testing)
    if (!profileData.personal.firstName?.trim()) {
      console.warn('⚠️ First name is empty, but allowing save for testing');
    }
    if (!profileData.personal.lastName?.trim()) {
      console.warn('⚠️ Last name is empty, but allowing save for testing');
    }
    
    // Only validate if trying to save completely empty profile
    const hasAnyData = profileData.personal.firstName || 
                      profileData.personal.lastName || 
                      profileData.personal.phone ||
                      profileData.experience.length > 0 ||
                      profileData.education.length > 0;
    
    if (!hasAnyData) {
      errors.push('Please add some profile information before saving');
    }
    
    return errors;
  };

  const saveProfile = async () => {
    try {
      // Check authentication from multiple sources
      const currentUser = getCurrentUser();
      const authUser = user; // From AuthContext
      const token = localStorage.getItem('token');
      
      console.log('🔐 Authentication check:');
      console.log('- getCurrentUser():', currentUser);
      console.log('- AuthContext user:', authUser);
      console.log('- Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No authentication token found');
        alert('Please log in again to save your profile');
        return;
      }
      
      if (!authUser && !currentUser) {
        console.error('❌ No authenticated user found');
        alert('Please log in again to save your profile');
        return;
      }
      
      // Use the available user data
      const userToSave = currentUser || authUser;
      console.log('👤 Using user for save:', userToSave);

      // Validate profile data
      const validationErrors = validateProfileData();
      if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n' + validationErrors.join('\n'));
        return;
      }

      console.log('💾 Saving profile data for user:', userToSave?.userId || userToSave?.id);
      console.log('📋 Profile data to save:', profileData);

      // Map frontend profile structure to backend format
      const backendProfile = {
        profile: {
          firstName: profileData.personal.firstName,
          lastName: profileData.personal.lastName,
          phone: profileData.personal.phone,
          dateOfBirth: profileData.personal.dateOfBirth,
          profilePicture: profileData.personal.profilePicture,
          address: {
            street: profileData.personal.street || '',
            city: profileData.personal.location,
            state: profileData.personal.state || '',
            country: profileData.personal.country || '',
            zipCode: profileData.personal.zipCode || ''
          },
          socialLinks: {
            linkedin: profileData.professional.linkedin,
            portfolio: profileData.professional.website,
            github: profileData.professional.github || '',
            twitter: profileData.professional.twitter || ''
          },
          // Role-specific profile data
          ...(user?.role === 'jobseeker' ? {
            jobSeekerProfile: {
              skills: profileData.professional.skills || [],
              experience: profileData.experience || [],
              education: profileData.education || [],
              resumePath: profileData.resume,
              bio: profileData.personal.bio,
              preferredJobTypes: profileData.professional.preferredJobTypes || [],
              preferredLocations: profileData.professional.preferredLocations || [],
              expectedSalary: profileData.professional.expectedSalary || {},
              availability: profileData.professional.availability || '',
              workAuthorization: profileData.professional.workAuthorization || ''
            }
          } : {}),
          ...(user?.role === 'recruiter' ? {
            recruiterProfile: {
              companyName: profileData.professional.company,
              industry: profileData.professional.industry,
              position: profileData.professional.title,
              yearsOfExperience: profileData.professional.yearsOfExperience,
              bio: profileData.personal.bio,
              specializations: profileData.professional.specializations || [],
              companySize: profileData.professional.companySize || '',
              companyDescription: profileData.professional.companyDescription || ''
            }
          } : {})
        }
      };

      console.log('🔄 Sending profile data to backend:', backendProfile);

      const data = await makeAuthenticatedRequest(API_ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(backendProfile)
      });

      console.log('📄 Backend response data:', data);
      
      if (data.success) {
        // Also save to localStorage as backup
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        setIsEditing(false);
        console.log('✅ Profile saved successfully to database');
        
        // Show success message to user (you can add a toast notification here)
        alert('Profile saved successfully!');
      } else {
        console.error('❌ Failed to save profile to database:', data.message);
        alert('Failed to save profile: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error saving profile to database:', error);
      
      // Still save to localStorage as fallback
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      setIsEditing(false);
      
      alert('Profile saved locally, but failed to sync with database. Please try again later.');
    }
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
        setProfileData(prev => ({ ...prev, resume: file }));
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-0 py-0">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
              {/* Profile Picture Section */}
              <div className="p-6 text-center border-b border-gray-200">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {profileData?.personal?.profilePicture ? (
                      <img src={profileData.personal.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <IoPersonOutline className="text-3xl text-gray-400" />
                    )}
                  </div>
                  {user?.role === 'recruiter' && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                      <IoBusinessOutline className="text-sm text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {profileData?.personal?.firstName || user?.name || 'User'} {profileData?.personal?.lastName || ''}
                </h3>
                <p className="text-sm text-gray-600 capitalize mb-2">
                  {user?.role === 'recruiter' ? 'Recruiter' : user?.role || 'Job Seeker'}
                </p>
                {profileData?.professional?.company && (
                  <p className="text-sm text-gray-500">
                    {profileData.professional.company}
                  </p>
                )}
                {isEditing && (
                  <label className="mt-4 inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium text-blue-700">
                    <IoCloudUploadOutline />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profilePicture')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="p-4">
                <nav className="space-y-2">
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'personal' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setActiveTab('personal')}
                  >
                    <IoPersonOutline className="text-lg flex-shrink-0" />
                    <span className="font-medium">Personal Info</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'professional' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setActiveTab('professional')}
                  >
                    <IoBriefcaseOutline className="text-lg flex-shrink-0" />
                    <span className="font-medium">{user?.role === 'recruiter' ? 'Company Info' : 'Professional'}</span>
                  </button>
                  {user?.role !== 'recruiter' && (
                    <>
                      <button
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                          activeTab === 'experience' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                        onClick={() => setActiveTab('experience')}
                      >
                        <IoBriefcaseOutline className="text-lg flex-shrink-0" />
                        <span className="font-medium">Experience</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                          activeTab === 'education' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                        onClick={() => setActiveTab('education')}
                      >
                        <IoDocumentTextOutline className="text-lg flex-shrink-0" />
                        <span className="font-medium">Education</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                          activeTab === 'resume' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                        onClick={() => setActiveTab('resume')}
                      >
                        <IoCloudUploadOutline className="text-lg flex-shrink-0" />
                        <span className="font-medium">Resume</span>
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-gray-25 to-blue-25 px-8 py-6 border-b border-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">Profile Information</h2>
                    <p className="text-gray-500 text-sm">Manage and update your profile details</p>
                  </div>
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button 
                          className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          onClick={saveProfile}
                        >
                          Save Changes
                        </button>
                        <button 
                          className="px-6 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 pt-4">
                {/* Personal Details Tab */}
            {activeTab === 'personal' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.personal.firstName}
                      onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.personal.lastName}
                      onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.personal.email}
                      onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.personal.phone}
                      onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.personal.location}
                      onChange={(e) => handleInputChange('personal', 'location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.personal.dateOfBirth}
                      onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.personal.bio}
                    onChange={(e) => handleInputChange('personal', 'bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* Professional Info Tab */}
            {activeTab === 'professional' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {user?.role === 'recruiter' ? 'Recruiting Information' : 'Professional Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {user?.role === 'recruiter' ? 'Recruiting Title' : 'Job Title'}
                    </label>
                    <input
                      type="text"
                      value={profileData.professional.title}
                      onChange={(e) => handleInputChange('professional', 'title', e.target.value)}
                      disabled={!isEditing}
                      placeholder={user?.role === 'recruiter' ? 'e.g., Senior Talent Acquisition Specialist' : 'e.g., Software Engineer'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={profileData.professional.company}
                      onChange={(e) => handleInputChange('professional', 'company', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={profileData.professional.industry}
                      onChange={(e) => handleInputChange('professional', 'industry', e.target.value)}
                      disabled={!isEditing}
                      placeholder={user?.role === 'recruiter' ? 'e.g., Human Resources, Technology' : 'e.g., Technology'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {user?.role === 'recruiter' ? 'Years in Recruiting' : 'Years of Experience'}
                    </label>
                    <input
                      type="number"
                      value={profileData.professional.yearsOfExperience}
                      onChange={(e) => handleInputChange('professional', 'yearsOfExperience', e.target.value)}
                      disabled={!isEditing}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <IoLogoLinkedin className="text-blue-600" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profileData.professional.linkedin}
                      onChange={(e) => handleInputChange('professional', 'linkedin', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <IoGlobeOutline className="text-gray-600" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileData.professional.website}
                      onChange={(e) => handleInputChange('professional', 'website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Skills</label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                    {isEditing && (
                      <button 
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={addSkill}
                      >
                        <IoAddOutline />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.professional.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                        {isEditing && (
                          <button 
                            onClick={() => removeSkill(skill)} 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <IoTrashOutline className="text-xs" />
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
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700">Work Experience</h2>
                  {isEditing && (
                    <button
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          experience: [...prev.experience, {
                            title: '',
                            company: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            current: false,
                            description: ''
                          }]
                        }));
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <IoAddOutline />
                      Add Experience
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => {
                              const newExp = [...profileData.experience];
                              newExp[index].title = e.target.value;
                              setProfileData(prev => ({ ...prev, experience: newExp }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Software Engineer"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const newExp = [...profileData.experience];
                              newExp[index].company = e.target.value;
                              setProfileData(prev => ({ ...prev, experience: newExp }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Google Inc."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => {
                              const newExp = [...profileData.experience];
                              newExp[index].location = e.target.value;
                              setProfileData(prev => ({ ...prev, experience: newExp }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., San Francisco, CA"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => {
                              const newExp = [...profileData.experience];
                              newExp[index].startDate = e.target.value;
                              setProfileData(prev => ({ ...prev, experience: newExp }));
                            }}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => {
                              const newExp = [...profileData.experience];
                              newExp[index].endDate = e.target.value;
                              setProfileData(prev => ({ ...prev, experience: newExp }));
                            }}
                            disabled={!isEditing || exp.current}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => {
                              const newExp = [...profileData.experience];
                              newExp[index].current = e.target.checked;
                              if (e.target.checked) newExp[index].endDate = '';
                              setProfileData(prev => ({ ...prev, experience: newExp }));
                            }}
                            disabled={!isEditing}
                            className="mr-2"
                          />
                          <label className="text-sm text-gray-700">Currently working here</label>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const newExp = [...profileData.experience];
                            newExp[index].description = e.target.value;
                            setProfileData(prev => ({ ...prev, experience: newExp }));
                          }}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Describe your responsibilities and achievements..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => {
                            const newExp = profileData.experience.filter((_, i) => i !== index);
                            setProfileData(prev => ({ ...prev, experience: newExp }));
                          }}
                          className="text-red-600 hover:text-red-800 flex items-center gap-2"
                        >
                          <IoTrashOutline />
                          Remove Experience
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {profileData.experience.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <IoBriefcaseOutline className="text-4xl mx-auto mb-4 text-gray-300" />
                      <p>No work experience added yet.</p>
                      {isEditing && <p className="text-sm">Click "Add Experience" to get started.</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700">Education</h2>
                  {isEditing && (
                    <button
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          education: [...prev.education, {
                            institution: '',
                            degree: '',
                            field: '',
                            startDate: '',
                            endDate: '',
                            current: false,
                            gpa: ''
                          }]
                        }));
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <IoAddOutline />
                      Add Education
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const newEdu = [...profileData.education];
                              newEdu[index].institution = e.target.value;
                              setProfileData(prev => ({ ...prev, education: newEdu }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Stanford University"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...profileData.education];
                              newEdu[index].degree = e.target.value;
                              setProfileData(prev => ({ ...prev, education: newEdu }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Bachelor of Science"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => {
                              const newEdu = [...profileData.education];
                              newEdu[index].field = e.target.value;
                              setProfileData(prev => ({ ...prev, education: newEdu }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Computer Science"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">GPA (Optional)</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => {
                              const newEdu = [...profileData.education];
                              newEdu[index].gpa = e.target.value;
                              setProfileData(prev => ({ ...prev, education: newEdu }));
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., 3.8/4.0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => {
                              const newEdu = [...profileData.education];
                              newEdu[index].startDate = e.target.value;
                              setProfileData(prev => ({ ...prev, education: newEdu }));
                            }}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => {
                              const newEdu = [...profileData.education];
                              newEdu[index].endDate = e.target.value;
                              setProfileData(prev => ({ ...prev, education: newEdu }));
                            }}
                            disabled={!isEditing || edu.current}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={edu.current}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].current = e.target.checked;
                            if (e.target.checked) newEdu[index].endDate = '';
                            setProfileData(prev => ({ ...prev, education: newEdu }));
                          }}
                          disabled={!isEditing}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Currently studying here</label>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => {
                            const newEdu = profileData.education.filter((_, i) => i !== index);
                            setProfileData(prev => ({ ...prev, education: newEdu }));
                          }}
                          className="text-red-600 hover:text-red-800 flex items-center gap-2"
                        >
                          <IoTrashOutline />
                          Remove Education
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {profileData.education.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <IoDocumentTextOutline className="text-4xl mx-auto mb-4 text-gray-300" />
                      <p>No education added yet.</p>
                      {isEditing && <p className="text-sm">Click "Add Education" to get started.</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Resume</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {profileData.resume ? (
                    <div className="space-y-4">
                      <IoCheckmarkCircleOutline className="text-5xl text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Resume Uploaded</p>
                        <p className="text-gray-600">Your resume is ready to be viewed by employers</p>
                      </div>
                      <div className="flex justify-center gap-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <IoDownloadOutline />
                          Download
                        </button>
                        {isEditing && (
                          <label className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                            <IoCloudUploadOutline />
                            Replace Resume
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(e, 'resume')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <IoCloudUploadOutline className="text-5xl text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload Your Resume</p>
                        <p className="text-gray-600">Upload your resume in PDF, DOC, or DOCX format</p>
                      </div>
                      {isEditing ? (
                        <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2">
                          <IoCloudUploadOutline />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileUpload(e, 'resume')}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <p className="text-gray-500">Click "Edit Profile" to upload your resume</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };
export default Profile;
