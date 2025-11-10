import React from 'react';
import { IoPeopleOutline, IoConstructOutline } from 'react-icons/io5';

const Candidates = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Icon */}
          <div className="mb-8">
            <div className="relative inline-flex">
              <IoPeopleOutline className="text-6xl text-blue-600 mb-4" />
              <IoConstructOutline className="absolute -bottom-1 -right-1 text-2xl text-orange-500 bg-white rounded-full p-1" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Candidates Page
          </h1>
          
          {/* Coming Soon Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              Coming Soon...
            </h2>
            <p className="text-blue-700 leading-relaxed">
              We're working hard to bring you an amazing candidate management experience. 
              This page will feature candidate profiles, search filters, application tracking, 
              and advanced recruitment tools.
            </p>
          </div>
          
          {/* Features Preview */}
          <div className="text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Coming:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Browse and search candidate profiles
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Advanced filtering and sorting options
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Application status tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Communication tools and notes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Interview scheduling integration
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Candidates;
