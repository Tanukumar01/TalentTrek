import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoBriefcaseOutline, IoPersonOutline, IoLogOutOutline, IoChevronDownOutline, IoStarOutline } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const companies = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Microsoft', url: 'https://www.microsoft.com' },
    { name: 'Amazon', url: 'https://www.amazon.com' },
    { name: 'Infosys', url: 'https://www.infosys.com' },
    { name: 'Tata Consultancy Services', url: 'https://www.tcs.com' },
    { name: 'Accenture', url: 'https://www.accenture.com' },
  ];

  return (
    <nav className="navbar">
       
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <IoBriefcaseOutline className="navbar-logo" />
          <span className="brand-name">TalentTrek</span>
        </Link>
      </div>

       
      <div className="navbar-center">
        <Link to="/browse-jobs">Find Jobs</Link>
        <div
          className="navbar-companies-dropdown-wrapper"
          onMouseEnter={() => setShowCompanies(true)}
          onMouseLeave={() => setShowCompanies(false)}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <span
            className="navbar-companies-link"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/companies')}
          >Companies</span>
          {showCompanies && (
            <div className="companies-dropdown" style={{ position: 'absolute', top: '100%', left: 0, background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderRadius: '8px', zIndex: 10, minWidth: '200px', padding: '10px 0' }}>
              {companies.map((company, idx) => (
                <a
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', padding: '8px 20px', color: '#333', textDecoration: 'none', fontWeight: 500 }}
                  onClick={() => setShowCompanies(false)}
                >
                  {company.name}
                </a>
              ))}
            </div>
          )}
        </div>
        <a href="#">Career Resources</a>
        <a href="#" >Salary Guide</a>
      </div>

       
      <div className="navbar-right">
        {isAuthenticated ? (
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
                <Link to="/browse-jobs" className="dropdown-item">
                  <IoBriefcaseOutline />
                  Browse Jobs
                </Link>
                <Link to="/job-recommendations" className="dropdown-item">
                  <IoStarOutline />
                  Job Recommendations
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
