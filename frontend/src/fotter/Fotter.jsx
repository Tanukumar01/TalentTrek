import React from 'react';
import './Fotter.css';
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-section logo-section">
          <h2 className="logo"><span className="icon">💼</span> TalentTrek</h2>
          <p>Connecting talented professionals with amazing opportunities.</p>
        </div>
        <div className="footer-section">
          <h3>For Job Seekers</h3>
          <ul>
            <li><a href="#">Browse Jobs</a></li>
            <li><a href="#">Career Resources</a></li>
            <li><a href="#">Salary Calculator</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>For Employers</h3>
          <ul>
            <li><a href="#">Post a Job</a></li>
            <li><a href="#">Hiring Solutions</a></li>
            <li><a href="#">Pricing</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-icons">
          <a href="#"><FaSquareXTwitter /></a>
            <a href="#"> <FaLinkedin/></a>
            <a href="#"><IoLogoGithub/></a>
          </div>
        </div>
      </div>
      <hr />
      <div className="footer-bottom">
        <p>© 2024 TalentTrek. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
