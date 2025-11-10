import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoBriefcaseOutline, 
  IoPersonOutline, 
  IoLogOutOutline, 
  IoChevronDownOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
  IoAddOutline,
  IoNotificationsOutline
} from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ isSimplified = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className={`navbar ${isSimplified ? 'navbar-simplified' : ''}`}>
       
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <IoBriefcaseOutline className="navbar-logo" />
          <span className="brand-name">TalentTrek</span>
        </Link>
      </div>

      {/* Conditionally render navbar center - hide for simplified layout */}
      {!isSimplified && (
        <div className="navbar-center">
          {/* Show different navigation based on user role */}
          {isAuthenticated && user?.role === 'recruiter' ? (
            // Enhanced Recruiter Navigation
            <>
              <Link to="/dashboard" className="navbar-link-enhanced">
                <IoBriefcaseOutline className="navbar-link-icon" />
                Dashboard
              </Link>
              <Link to="/post-job" className="navbar-link-enhanced">
                <IoAddOutline className="navbar-link-icon" />
                Post Jobs
              </Link>
              <Link to="/candidates" className="navbar-link-enhanced">
                <IoPeopleOutline className="navbar-link-icon" />
                Candidates
              </Link>
              <Link to="/analytics" className="navbar-link-enhanced">
                <IoStatsChartOutline className="navbar-link-icon" />
                Analytics
              </Link>
            </>
          ) : (
            // Job Seeker Navigation (default)
            <>
              <Link to="/">Home</Link>
              <Link to="/browse-jobs">Browse Jobs</Link>
              <Link to="/companies">Companies</Link>
              <a href="#">Career Resources</a>
            </>
          )}
        </div>
      )}

       
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="navbar-right-authenticated">
            {/* Enhanced features for recruiters */}
            {user?.role === 'recruiter' && (
              <>
                {/* Notifications */}
                <button className="navbar-notification-btn">
                  <IoNotificationsOutline className="notification-icon" />
                  <span className="notification-badge">3</span>
                </button>
              </>
            )}
            
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <IoPersonOutline className="user-icon" />
                <span className="user-name">{user?.name || 'User'}</span>
                <IoChevronDownOutline className="dropdown-icon" />
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="user-email">{user?.email}</p>
                    <p className="user-role">{user?.role}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item">
                    <IoPersonOutline />
                    Profile
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <IoBriefcaseOutline />
                    Dashboard
                  </Link>
                  {user?.role === 'recruiter' && (
                    <Link to="/post-job" className="dropdown-item">
                      <IoBriefcaseOutline />
                      Post a Job
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <IoLogOutOutline />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Link to="/login" className="sign-in">Sign In</Link>
            <Link to="/signup" className="post-job">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
