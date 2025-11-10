import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoBriefcaseOutline, 
  IoPeopleOutline, 
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoMailOutline,
  IoTrendingUpOutline,
  IoPersonOutline,
  IoVideocamOutline,
  IoSettingsOutline,
  IoSearchOutline,
  IoNotificationsOutline,
  IoAddOutline,
  IoFilterOutline,
  IoLogOutOutline,
  IoHomeOutline
} from 'react-icons/io5';

const experienceFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Freshers', value: 'freshers' },
  { label: '0-2 years', value: '0-2' },
  { label: 'Above 2 years', value: '2plus' },
];

const RecruiterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

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
        const res = await fetch(API_ENDPOINTS.JOB_APPLICATIONS(selectedJobId), {
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

  // Calculate stats
  const totalApplications = applications.length;
  const filteredApplications = getFilteredApplications();
  const totalJobs = jobs.length;
  const selectedJob = jobs.find(job => job._id === selectedJobId);

  // Real dashboard stats based on actual data
  const dashboardStats = {
    openPositions: totalJobs || 0,
    totalCandidates: totalApplications || 0,
    interviewsScheduled: applications.filter(app => app.status === 'interview').length,
    offersExtended: applications.filter(app => app.status === 'offer').length,
    interviewSuccessRate: totalApplications > 0 ? Math.round((applications.filter(app => app.status === 'hired').length / totalApplications) * 100) : 0,
    newApplications: applications.filter(app => {
      const appDate = new Date(app.appliedAt || app.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - appDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Applications from last 7 days
    }).length
  };

  // Calculate real candidate pipeline from applications
  const getCandidatePipeline = () => {
    const appliedApps = applications.filter(app => app.status === 'pending' || !app.status);
    const screeningApps = applications.filter(app => app.status === 'reviewed');
    const interviewApps = applications.filter(app => app.status === 'interview');
    const offerApps = applications.filter(app => app.status === 'offer');
    const hiredApps = applications.filter(app => app.status === 'hired');

    return [
      { 
        stage: 'Applied', 
        count: appliedApps.length, 
        candidates: appliedApps.slice(0, 3).map(app => app.userId?.name || app.applicantName || 'Unknown')
      },
      { 
        stage: 'Screening', 
        count: screeningApps.length, 
        candidates: screeningApps.slice(0, 3).map(app => app.userId?.name || app.applicantName || 'Unknown')
      },
      { 
        stage: 'Interview', 
        count: interviewApps.length, 
        candidates: interviewApps.slice(0, 3).map(app => app.userId?.name || app.applicantName || 'Unknown')
      },
      { 
        stage: 'Offer', 
        count: offerApps.length, 
        candidates: offerApps.slice(0, 3).map(app => app.userId?.name || app.applicantName || 'Unknown')
      },
      { 
        stage: 'Hired', 
        count: hiredApps.length, 
        candidates: hiredApps.slice(0, 3).map(app => app.userId?.name || app.applicantName || 'Unknown')
      }
    ];
  };

  // Get real upcoming interviews (applications with interview status)
  const getUpcomingInterviews = () => {
    return applications
      .filter(app => app.status === 'interview')
      .slice(0, 5)
      .map(app => ({
        id: app._id,
        candidateName: app.userId?.name || app.applicantName || 'Unknown',
        position: jobs.find(job => job._id === app.jobId)?.title || 'Unknown Position',
        time: 'To be scheduled',
        type: 'To be determined',
        interviewer: user?.name || 'TBD'
      }));
  };

  const candidatePipeline = getCandidatePipeline();
  const upcomingInterviews = getUpcomingInterviews();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand Only */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <IoBriefcaseOutline className="text-2xl text-blue-600" />
                <span className="text-xl font-bold text-gray-900">TalentTrek</span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* New Job Button */}
              <Link 
                to="/post-job"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <IoAddOutline className="text-base" />
                <span className="hidden sm:inline">New Job</span>
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <IoNotificationsOutline className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4 relative profile-dropdown-container">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Recruiter'}</p>
                  <p className="text-xs text-gray-500">Recruiter</p>
                </div>
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                  title="Profile Options"
                >
                  <span className="text-blue-600 font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'R'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <IoPersonOutline />
                        View Profile
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <IoLogOutOutline />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Recruiter'}!</h2>
              <p className="text-gray-600">Here's what's happening with your recruitment today.</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Positions</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.openPositions}</p>
                <div className="flex items-center mt-2">
                  {dashboardStats.openPositions > 0 ? (
                    <>
                      <IoTrendingUpOutline className="text-green-500 text-sm mr-1" />
                      <span className="text-sm text-green-600">Active positions</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No positions posted yet</span>
                  )}
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <IoBriefcaseOutline className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalCandidates}</p>
                <div className="flex items-center mt-2">
                  {dashboardStats.totalCandidates > 0 ? (
                    <>
                      <IoTrendingUpOutline className="text-green-500 text-sm mr-1" />
                      <span className="text-sm text-green-600">Total applications</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No applications yet</span>
                  )}
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IoPeopleOutline className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.interviewsScheduled}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">No interviews scheduled</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <IoCalendarOutline className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offers Extended</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.offersExtended}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">No offers extended yet</span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <IoCheckmarkCircleOutline className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Insights */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <IoStatsChartOutline className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <IoCheckmarkCircleOutline className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Applications Received</h4>
                <p className="text-sm text-gray-600 mt-1">{dashboardStats.totalCandidates} total applications across all positions</p>
                <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800">Review Now</button>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <IoTrendingUpOutline className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Interview Success Rate</h4>
                <p className="text-sm text-gray-600 mt-1">{dashboardStats.interviewSuccessRate}% of candidates progressed to interviews</p>
                <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800">Optimize</button>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <IoPersonOutline className="text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Active Positions</h4>
                <p className="text-sm text-gray-600 mt-1">{dashboardStats.openPositions} job postings currently accepting applications</p>
                <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800">Manage</button>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <IoDocumentTextOutline className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Applications</p>
                <p className="text-sm text-gray-600">{dashboardStats.totalCandidates} applications automatically ranked and categorized</p>
                <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800">View Results</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Pipeline */}
          <div className="lg:col-span-2">
            {/* Candidate Pipeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Candidate Pipeline</h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                    <IoStatsChartOutline />
                    AI Enhanced
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {totalApplications === 0 ? (
                  <div className="text-center py-12">
                    <IoPeopleOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Yet</h3>
                    <p className="text-gray-600 mb-6">Start by posting a job to attract candidates to your pipeline.</p>
                    <Link 
                      to="/post-job"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <IoBriefcaseOutline />
                      Post Your First Job
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      {candidatePipeline.map((stage, index) => (
                        <div key={stage.stage} className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mb-2 ${
                            stage.stage === 'Applied' ? 'bg-blue-500' :
                            stage.stage === 'Screening' ? 'bg-yellow-500' :
                            stage.stage === 'Interview' ? 'bg-purple-500' :
                            stage.stage === 'Offer' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}>
                            {stage.count}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                          {index < candidatePipeline.length - 1 && (
                            <div className="absolute w-16 h-0.5 bg-gray-300 mt-6 ml-16"></div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Pipeline Details */}
                    <div className="grid grid-cols-5 gap-4">
                      {candidatePipeline.map((stage) => (
                        <div key={stage.stage} className="text-center">
                          <div className="space-y-2">
                            {stage.candidates.slice(0, 2).map((candidate, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {candidate.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 truncate">{candidate}</p>
                                <div className="flex items-center justify-center mt-1">
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                    {stage.stage}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {stage.count > 2 && (
                              <div className="text-xs text-gray-500">+{stage.count - 2} more</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Job Postings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Active Job Postings</h3>
                  <Link to="/post-job" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {totalJobs === 0 ? (
                  <div className="text-center py-12">
                    <IoBriefcaseOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Postings Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first job posting to start recruiting candidates.</p>
                    <Link 
                      to="/post-job"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <IoBriefcaseOutline />
                      Post a Job
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                  <div key={job._id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{job.company} • {typeof job.location === 'object' ? `${job.location.city}, ${job.location.country}` : job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoEyeOutline className="text-gray-400" />
                        <button className="text-gray-400 hover:text-gray-600">
                          <IoSettingsOutline />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          👥 {applications.filter(app => app.jobId === job._id).length} candidates
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          🤖 AI matched
                        </span>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                    
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Applications</span>
                          <span>{applications.filter(app => app.jobId === job._id).length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((applications.filter(app => app.jobId === job._id).length / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Interviews */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {dashboardStats.interviewsScheduled} scheduled
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {dashboardStats.interviewsScheduled === 0 ? (
                  <div className="text-center py-12">
                    <IoCalendarOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
                    <p className="text-gray-600">Schedule interviews with candidates when you receive applications.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {interview.candidateName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{interview.candidateName}</h4>
                        <p className="text-sm text-gray-600">{interview.position}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <IoCalendarOutline className="text-xs" />
                          <span>{interview.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          {interview.type === 'Video Call' ? (
                            <>
                              <IoVideocamOutline className="text-blue-500 text-xs" />
                              <span className="text-blue-600">Video Call</span>
                            </>
                          ) : (
                            <>
                              <IoPersonOutline className="text-green-500 text-xs" />
                              <span className="text-green-600">In Person</span>
                            </>
                          )}
                          <span className="text-gray-500">with {interview.interviewer}</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <IoSettingsOutline />
                      </button>
                    </div>
                  </div>
                    ))}
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

export default RecruiterDashboard;