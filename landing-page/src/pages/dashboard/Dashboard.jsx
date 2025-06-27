import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { IoPersonOutline, IoBriefcaseOutline, IoDocumentTextOutline, IoStatsChartOutline, IoNotificationsOutline, IoSettingsOutline } from 'react-icons/io5';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  // Get profile data from localStorage
  const getProfileData = () => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  };

  const profileData = getProfileData();

  const stats = [
    {
      title: 'Profile Completion',
      value: profileData ? '85%' : '0%',
      icon: <IoPersonOutline />,
      color: '#667eea'
    },
    {
      title: 'Applications',
      value: '12',
      icon: <IoBriefcaseOutline />,
      color: '#48bb78'
    },
    {
      title: 'Saved Jobs',
      value: '8',
      icon: <IoDocumentTextOutline />,
      color: '#ed8936'
    },
    {
      title: 'Profile Views',
      value: '24',
      icon: <IoStatsChartOutline />,
      color: '#e53e3e'
    }
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal and professional information',
      icon: <IoPersonOutline />,
      link: '/profile',
      color: '#667eea'
    },
    {
      title: 'Upload Resume',
      description: 'Add or update your resume to attract employers',
      icon: <IoDocumentTextOutline />,
      link: '/profile',
      color: '#48bb78'
    },
    {
      title: 'Job Alerts',
      description: 'Manage your job search preferences',
      icon: <IoNotificationsOutline />,
      link: '#',
      color: '#ed8936'
    },
    {
      title: 'Account Settings',
      description: 'Update your account preferences and security',
      icon: <IoSettingsOutline />,
      link: '#',
      color: '#e53e3e'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Here's what's happening with your job search</p>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {profileData?.personal?.profilePicture ? (
              <img src={profileData.personal.profilePicture} alt="Profile" />
            ) : (
              <IoPersonOutline />
            )}
          </div>
          <div className="user-details">
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.role || 'Job Seeker'}</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className="action-card">
                <div className="action-icon" style={{ backgroundColor: action.color }}>
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <IoBriefcaseOutline />
              </div>
              <div className="activity-content">
                <h4>Application Submitted</h4>
                <p>Software Engineer at TechCorp</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <IoDocumentTextOutline />
              </div>
              <div className="activity-content">
                <h4>Resume Updated</h4>
                <p>Your resume was updated successfully</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <IoStatsChartOutline />
              </div>
              <div className="activity-content">
                <h4>Profile Viewed</h4>
                <p>Your profile was viewed by 3 employers</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 