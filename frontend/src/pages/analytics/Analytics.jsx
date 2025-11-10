import React from 'react';
import { IoStatsChartOutline, IoConstructOutline } from 'react-icons/io5';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Icon */}
          <div className="mb-8">
            <div className="relative inline-flex">
              <IoStatsChartOutline className="text-6xl text-green-600 mb-4" />
              <IoConstructOutline className="absolute -bottom-1 -right-1 text-2xl text-orange-500 bg-white rounded-full p-1" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analytics Dashboard
          </h1>
          
          {/* Coming Soon Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              Coming Soon...
            </h2>
            <p className="text-green-700 leading-relaxed">
              Get ready for powerful insights and data-driven recruitment analytics. 
              This dashboard will provide comprehensive metrics, trends, and performance 
              indicators to optimize your hiring process.
            </p>
          </div>
          
          {/* Features Preview */}
          <div className="text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Coming:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Recruitment performance metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Application conversion rates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Time-to-hire analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Source effectiveness tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Interactive charts and reports
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
