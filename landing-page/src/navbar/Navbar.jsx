import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoBriefcaseOutline, IoPersonOutline, IoLogOutOutline, IoChevronDownOutline } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
       
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <IoBriefcaseOutline className="navbar-logo" />
          <span className="brand-name">TalentTrek</span>
        </Link>
      </div>

       
      <div className="navbar-center">
        <a href="#">Find Jobs</a>
        <a href="#">Companies</a>
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
