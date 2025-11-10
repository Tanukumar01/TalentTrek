import React, { useState } from 'react';
import { 
  IoLocationOutline, 
  IoBriefcaseOutline, 
  IoSearchOutline,
  IoFilterOutline,
  IoStarOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoGlobeOutline
} from 'react-icons/io5';

const companies = [
  {
    id: 1,
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    industry: 'Technology',
    size: '100,000+ employees',
    rating: 4.4,
    openJobs: 1250,
    careerUrl: 'https://careers.google.com/jobs/results/',
    description: 'A multinational technology company specializing in Internet-related services and products.',
    jobs: [
      { title: 'Software Engineer', location: 'Mountain View, CA', type: 'Full-time', posted: '2 days ago', applyUrl: 'https://careers.google.com/jobs/results/123456789/' },
      { title: 'Product Manager', location: 'New York, NY', type: 'Full-time', posted: '1 week ago', applyUrl: 'https://careers.google.com/jobs/results/987654321/' },
      { title: 'Data Scientist', location: 'Seattle, WA', type: 'Full-time', posted: '3 days ago', applyUrl: 'https://careers.google.com/jobs/results/456789123/' }
    ]
  },
  {
    id: 2,
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    industry: 'Technology',
    size: '200,000+ employees',
    rating: 4.2,
    openJobs: 890,
    careerUrl: 'https://careers.microsoft.com/us/en/search-results',
    description: 'A multinational technology corporation producing computer software, consumer electronics, and personal computers.',
    jobs: [
      { title: 'Cloud Solutions Architect', location: 'Redmond, WA', type: 'Full-time', posted: '1 day ago', applyUrl: 'https://careers.microsoft.com/us/en/job/1234567/' },
      { title: 'Azure Developer', location: 'Austin, TX', type: 'Full-time', posted: '4 days ago', applyUrl: 'https://careers.microsoft.com/us/en/job/7654321/' }
    ]
  },
  {
    id: 3,
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    industry: 'E-commerce & Cloud',
    size: '1,500,000+ employees',
    rating: 3.9,
    openJobs: 2100,
    careerUrl: 'https://www.amazon.jobs/en/',
    description: 'A multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.',
    jobs: [
      { title: 'Data Scientist', location: 'Seattle, WA', type: 'Full-time', posted: '2 days ago', applyUrl: 'https://www.amazon.jobs/en/jobs/2345678/' },
      { title: 'AWS Engineer', location: 'Virginia', type: 'Full-time', posted: '1 week ago', applyUrl: 'https://www.amazon.jobs/en/jobs/8765432/' }
    ]
  },
  {
    id: 4,
    name: 'Infosys',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    industry: 'IT Services',
    size: '300,000+ employees',
    rating: 3.8,
    openJobs: 450,
    careerUrl: 'https://www.infosys.com/careers/',
    description: 'A global leader in next-generation digital services and consulting.',
    jobs: [
      { title: 'Business Analyst', location: 'Bangalore, India', type: 'Full-time', posted: '3 days ago', applyUrl: 'https://www.infosys.com/careers/job/3456789/' },
      { title: 'Java Developer', location: 'Pune, India', type: 'Full-time', posted: '5 days ago', applyUrl: 'https://www.infosys.com/careers/job/9876543/' }
    ]
  },
  {
    id: 5,
    name: 'Tata Consultancy Services',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    industry: 'IT Services',
    size: '500,000+ employees',
    rating: 3.9,
    openJobs: 680,
    careerUrl: 'https://www.tcs.com/careers',
    description: 'An Indian multinational information technology services and consulting company.',
    jobs: [
      { title: 'Project Manager', location: 'Mumbai, India', type: 'Full-time', posted: '1 day ago', applyUrl: 'https://www.tcs.com/careers/job/4567890/' },
      { title: 'Full Stack Developer', location: 'Chennai, India', type: 'Full-time', posted: '6 days ago', applyUrl: 'https://www.tcs.com/careers/job/0987654/' }
    ]
  },
  {
    id: 6,
    name: 'Accenture',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
    industry: 'Consulting',
    size: '700,000+ employees',
    rating: 4.0,
    openJobs: 320,
    careerUrl: 'https://www.accenture.com/in-en/careers',
    description: 'A global professional services company with leading capabilities in digital, cloud and security.',
    jobs: [
      { title: 'UI/UX Designer', location: 'Dublin, Ireland', type: 'Full-time', posted: '2 days ago', applyUrl: 'https://www.accenture.com/careers/job/5678901/' },
      { title: 'Digital Consultant', location: 'London, UK', type: 'Full-time', posted: '1 week ago', applyUrl: 'https://www.accenture.com/careers/job/1098765/' }
    ]
  }
];

const CompaniesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const industries = ['All', 'Technology', 'E-commerce & Cloud', 'IT Services', 'Consulting'];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleApplyJob = (company, job) => {
    // Track that user clicked apply (for UI state)
    const jobKey = `${company.name}-${job.title}`;
    setAppliedJobs(prev => new Set([...prev, jobKey]));
    
    // Redirect to the actual job application page
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to company career page
      window.open(company.careerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isJobApplied = (company, job) => {
    const jobKey = `${company.name}-${job.title}`;
    return appliedJobs.has(jobKey);
  };

  const handleViewAllJobs = (company) => {
    // Redirect to company's career page
    window.open(company.careerUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCompanyClick = (company) => {
    // Redirect to company's career page
    window.open(company.careerUrl, '_blank', 'noopener,noreferrer');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedIndustry('All');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Companies & Jobs</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover opportunities at top companies worldwide. Find your dream job with leading organizations.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search companies or industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <IoFilterOutline className="text-gray-400" />
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              {(searchTerm || selectedIndustry !== 'All') && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              
              <div className="text-sm text-gray-500">
                {filteredCompanies.length} companies found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Company Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleCompanyClick(company)}
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="%236b7280">${company.name.charAt(0)}</text></svg>`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">{company.name}</h3>
                      <p className="text-gray-600">{company.industry}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <IoPeopleOutline />
                          <span>{company.size}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IoStarOutline />
                          <span>{company.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleViewAllJobs(company)}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {company.openJobs} open jobs
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-4 leading-relaxed">{company.description}</p>
              </div>

              {/* Jobs Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <IoBriefcaseOutline />
                    Recent Job Openings
                  </h4>
                  <button
                    onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {expandedCompany === company.id ? 'Show Less' : 'View All'}
                  </button>
                </div>

                <div className="space-y-3">
                  {company.jobs.slice(0, expandedCompany === company.id ? company.jobs.length : 2).map((job, idx) => {
                    const applied = isJobApplied(company, job);
                    return (
                      <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{job.title}</h5>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <IoLocationOutline />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IoTimeOutline />
                                <span>{job.posted}</span>
                              </div>
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {job.type}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleApplyJob(company, job)}
                            disabled={applied}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              applied 
                                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {applied ? 'Applied ✓' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {company.jobs.length > 2 && expandedCompany !== company.id && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setExpandedCompany(company.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +{company.jobs.length - 2} more jobs
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <IoGlobeOutline className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CompaniesDashboard;