import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  IoDocumentTextOutline, 
  IoBookmarkOutline, 
  IoChatbubbleOutline, 
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoSearchOutline,
  IoNotificationsOutline,
  IoCloudUploadOutline,
  IoEllipsisVerticalOutline,
  IoCalendarClearOutline,
  IoPersonOutline,
  IoHomeOutline,
  IoBriefcaseOutline
} from 'react-icons/io5';
import { API_ENDPOINTS } from '../../config/api';
import { makeAuthenticatedRequest, getCurrentUser } from '../../utils/apiUtils';
import Calendar from '../../components/Calendar';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [realApplications, setRealApplications] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadApplicationsData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-menu')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const loadDashboardData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }

      // Load user-specific dashboard data
      const data = await makeAuthenticatedRequest(API_ENDPOINTS.USER_DASHBOARD);
      if (data.success) {
        setDashboardData(data.data);
        console.log('Dashboard data loaded:', data.data);
      } else {
        console.error('Failed to load dashboard data:', data.message);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load applications data
  const loadApplicationsData = async () => {
    try {
      const data = await makeAuthenticatedRequest(API_ENDPOINTS.USER_APPLICATIONS);
      if (data.success) {
        setRealApplications(data.applications);
        console.log('Applications loaded:', data.applications);
      } else {
        console.error('Failed to load applications:', data.message);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  // Statistics data from backend or fallback
  const getStats = () => {
    const statistics = dashboardData?.statistics;
    return [
      {
        title: 'Job Applications',
        subtitle: 'vs last month',
        value: statistics?.totalApplications?.toString() || '0',
        change: '+30%',
        changeType: 'increase',
        icon: <IoDocumentTextOutline />,
        bgColor: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Upcoming Interviews',
        subtitle: 'vs last month',
        value: statistics?.upcomingInterviews?.toString() || '0',
        change: '+40%',
        changeType: 'increase',
        icon: <IoCalendarOutline />,
        bgColor: 'bg-orange-50',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600'
      },
      {
        title: 'Shortlisted',
        subtitle: 'vs last month',
        value: statistics?.shortlisted?.toString() || '0',
        change: '+30%',
        changeType: 'increase',
        icon: <IoBookmarkOutline />,
        bgColor: 'bg-green-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        title: 'Job Offers Received',
        subtitle: 'vs last month',
        value: statistics?.jobOffersReceived?.toString() || '0',
        change: '+30%',
        changeType: 'increase',
        icon: <IoTrendingUpOutline />,
        bgColor: 'bg-purple-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      },
      {
        title: 'Application Review',
        subtitle: 'vs last month',
        value: statistics?.applicationReview?.toString() || '0',
        change: '+15%',
        changeType: 'increase',
        icon: <IoDocumentTextOutline />,
        bgColor: 'bg-yellow-50',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      }
    ];
  };

  // Sidebar navigation items with real counts
  const getSidebarItems = () => {
    const statistics = dashboardData?.statistics;
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <IoHomeOutline />,
        active: true
      },
      {
        id: 'applications',
        title: 'Applications',
        icon: <IoDocumentTextOutline />,
        count: statistics?.totalApplications || realApplications.length
      },
      {
        id: 'saved-jobs',
        title: 'Saved Jobs',
        icon: <IoBookmarkOutline />,
        count: 0 // TODO: Implement saved jobs
      },
      {
        id: 'messages',
        title: 'Messages',
        icon: <IoChatbubbleOutline />,
        count: 0 // TODO: Implement messages
      },
      {
        id: 'schedule',
        title: 'My Schedule',
        icon: <IoCalendarOutline />,
        count: statistics?.upcomingInterviews || 0
      }
    ];
  };

  // No mock applications - only use real data from backend

  // Filter applications based on selected filters - only real applications
  const getFilteredApplications = () => {
    return realApplications.filter(app => {
      const statusMatch = statusFilter === 'All Status' || app.stage === statusFilter;
      const typeMatch = typeFilter === 'All Types' || app.type === typeFilter;
      return statusMatch && typeMatch;
    });
  };

  // Get applications for dashboard (first 4) - only real applications
  const applications = realApplications.slice(0, 4);

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  // Handle view profile
  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  // Handle logo click to navigate to home page
  const handleLogoClick = () => {
    navigate('/');
  };

  // Function to render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Welcome Section */}
            <div className="px-6 py-6 bg-white mt-20">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome back, {user?.name || 'Mayank'}!
                </h2>
                <p className="text-gray-600">You have 32 upcoming interviews this week</p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {getStats().map((stat, index) => (
                  <div key={index} className={`${stat.bgColor} rounded-xl p-4 border border-gray-100`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                        <span className={`${stat.iconColor} text-lg`}>
                          {stat.icon}
                        </span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.title}</div>
                      <div className="text-xs text-gray-500">{stat.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="flex-1 px-6 pb-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <IoDocumentTextOutline />
                    My Applications
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.length > 0 ? applications.map((app, index) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {app.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {app.jobTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {app.interview ? (
                              <div className="flex items-center gap-2">
                                <IoCalendarClearOutline className="text-purple-600" />
                                {app.interview}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {app.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${app.stageColor}`}>
                              {app.stage}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <IoDocumentTextOutline className="text-3xl text-gray-300 mb-3" />
                              <p className="text-gray-500">No applications yet</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        );

      case 'applications':
        return (
          <div className="px-6 py-6 mt-20">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <IoDocumentTextOutline />
                    All Applications
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {getFilteredApplications().length} of {realApplications.length} applications
                  </p>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Under Review</option>
                    <option>Rejected</option>
                  </select>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option>All Types</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                  </select>
                  {(statusFilter !== 'All Status' || typeFilter !== 'All Types') && (
                    <button 
                      onClick={() => {
                        setStatusFilter('All Status');
                        setTypeFilter('All Types');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Show filtered applications or empty state */}
                    {getFilteredApplications().length > 0 ? getFilteredApplications().map((app, index) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {app.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.jobTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.interview ? (
                            <div className="flex items-center gap-2">
                              <IoCalendarClearOutline className="text-purple-600" />
                              {app.interview}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {app.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${app.stageColor}`}>
                            {app.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.appliedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600">
                            <IoEllipsisVerticalOutline />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <IoDocumentTextOutline className="text-4xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet. Start exploring opportunities!</p>
                            <button 
                              onClick={() => navigate('/jobs')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Browse Jobs
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'saved-jobs':
        return (
          <div className="px-6 py-6 mt-20">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <IoBookmarkOutline />
                  Saved Jobs
                </h2>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search saved jobs..." 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 1, title: 'Senior React Developer', company: 'Tech Innovations', location: 'San Francisco, CA', salary: '$120k - $150k', saved: '2 days ago' },
                  { id: 2, title: 'Full Stack Engineer', company: 'StartupCo', location: 'Remote', salary: '$100k - $130k', saved: '5 days ago' },
                  { id: 3, title: 'Frontend Developer', company: 'Digital Agency', location: 'New York, NY', salary: '$90k - $120k', saved: '1 week ago' },
                  { id: 4, title: 'UI/UX Developer', company: 'Design Studio', location: 'Austin, TX', salary: '$85k - $110k', saved: '1 week ago' }
                ].map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <IoBookmarkOutline className="text-lg" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">{job.location}</p>
                      <p className="text-sm font-medium text-green-600">{job.salary}</p>
                      <p className="text-xs text-gray-400">Saved {job.saved}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        Apply Now
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="px-6 py-6 mt-20">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <IoChatbubbleOutline />
                  Messages
                </h2>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Messages</option>
                    <option>Unread</option>
                    <option>From Recruiters</option>
                    <option>Interview Related</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 1, from: 'Sarah Johnson - TechCorp Inc.', subject: 'Interview Invitation for Senior Frontend Developer', preview: 'Hi Mayank, We were impressed with your application and would like to invite you for an interview...', time: '2 hours ago', unread: true },
                  { id: 2, from: 'Mike Chen - Creative Agency', subject: 'Thank you for your application', preview: 'Thank you for applying to the Product Designer position. We have received your application...', time: '1 day ago', unread: true },
                  { id: 3, from: 'Lisa Wang - Innovation Labs', subject: 'Next steps in your application', preview: 'Congratulations! You have been shortlisted for the Full Stack Engineer position...', time: '2 days ago', unread: false },
                  { id: 4, from: 'David Brown - DataCorp', subject: 'Application Status Update', preview: 'We wanted to update you on the status of your application for the Backend Developer role...', time: '3 days ago', unread: false }
                ].map((message) => (
                  <div key={message.id} className={`border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer ${message.unread ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.from}
                          </h3>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <h4 className={`font-semibold mb-2 ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.subject}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{message.preview}</p>
                        <p className="text-xs text-gray-400 mt-2">{message.time}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <IoEllipsisVerticalOutline />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        const upcomingInterviews = [
          { id: 1, title: 'Technical Interview - TechCorp Inc.', type: 'Video Call', date: 'Nov 15, 2024', time: '2:00 PM - 3:00 PM', status: 'confirmed', color: 'blue' },
          { id: 2, title: 'HR Round - Creative Agency', type: 'Phone Call', date: 'Nov 16, 2024', time: '10:00 AM - 10:30 AM', status: 'confirmed', color: 'green' },
          { id: 3, title: 'Final Interview - Innovation Labs', type: 'In Person', date: 'Nov 18, 2024', time: '3:00 PM - 4:30 PM', status: 'pending', color: 'orange' },
          { id: 4, title: 'Team Meeting - DataCorp', type: 'Video Call', date: 'Nov 20, 2024', time: '11:00 AM - 12:00 PM', status: 'tentative', color: 'purple' },
          { id: 5, title: 'Follow-up Call - StartupCo', type: 'Phone Call', date: 'Nov 22, 2024', time: '4:00 PM - 4:30 PM', status: 'confirmed', color: 'blue' }
        ];

        return (
          <div className="px-6 py-6 mt-20">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <IoCalendarOutline />
                My Schedule
              </h2>
              <p className="text-gray-600">Manage your interview schedule and upcoming events</p>
            </div>

            {/* Calendar and Schedule Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Component */}
              <div className="lg:col-span-1">
                <Calendar interviews={upcomingInterviews} />
              </div>

              {/* Upcoming Interviews List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
                    <div className="flex gap-2">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>This Week</option>
                        <option>Next Week</option>
                        <option>This Month</option>
                        <option>All Upcoming</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {upcomingInterviews.map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-2 bg-${event.color}-500`}></div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <p className="text-gray-600 text-sm">{event.type}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <IoCalendarClearOutline />
                                  {event.date}
                                </span>
                                <span className="text-sm text-gray-500">{event.time}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  event.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <IoEllipsisVerticalOutline />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-container cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2" onClick={handleLogoClick}>
            <IoBriefcaseOutline className="logo-icon" />
            <span className="logo-text">TalentTrek</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {getSidebarItems().map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-item-content">
                <span className="nav-item-icon">
                  {item.icon}
                </span>
                <span>
                  {item.title}
                </span>
              </div>
              {item.count && (
                <span className="nav-item-count">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Profile Section at Bottom */}
        <div className="sidebar-profile">
          <div className="profile-container">
            <div className="profile-avatar">
              <span>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </span>
            </div>
            <div className="profile-info">
              <p className="profile-name">
                {user?.name || 'Mayank Yadav'}
              </p>
              <p className="profile-role">
                Software Developer
              </p>
            </div>
            <div className="profile-menu relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoEllipsisVerticalOutline />
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleViewProfile}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <IoPersonOutline />
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen">
        {/* Top Header - Fixed */}
        <div className="bg-white px-6 py-4 flex items-center justify-between fixed top-0 left-64 right-0 z-20 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Track your job search journey</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <IoNotificationsOutline className="text-xl" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on Active Tab */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 