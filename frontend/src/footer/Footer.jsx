import React from 'react';
import { FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import { IoLogoGithub, IoBriefcaseOutline, IoMailOutline, IoLocationOutline } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-50 to-sky-100 border-t border-blue-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl">
                <IoBriefcaseOutline className="text-xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">TalentTrek</h2>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              Connecting talented professionals with amazing opportunities.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <IoMailOutline className="text-blue-600 text-sm" />
                <span className="text-xs">contact.talentrek.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <IoLocationOutline className="text-blue-600 text-sm" />
                <span className="text-xs">Noida, India</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex gap-2">
              <a 
                href="#" 
                className="w-9 h-9 bg-white hover:bg-blue-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="Twitter"
              >
                <FaSquareXTwitter className="text-sm" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white hover:bg-blue-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-sm" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white hover:bg-blue-600 text-gray-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="GitHub"
              >
                <IoLogoGithub className="text-sm" />
              </a>
            </div>
          </div>
          
          {/* For Job Seekers */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/browse-jobs" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/companies" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Companies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Career Resources
                </a>
              </li>
            </ul>
          </div>
          
          {/* For Employers */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Employers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/post-job" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Find Candidates
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-blue-200 bg-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-700 text-sm">
              © 2025 TalentTrek. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
