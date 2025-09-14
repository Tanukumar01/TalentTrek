import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBriefcaseOutline, IoLocationOutline, IoTimeOutline, IoStarOutline } from 'react-icons/io5';
import { API_ENDPOINTS } from '../../config/api';

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
      } else {
        setError('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = !typeFilter || job.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesType;
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Loading jobs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#ef4444'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>Browse Jobs</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Discover amazing opportunities that match your interests</p>
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'end'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Search Jobs
          </label>
          <input
            type="text"
            placeholder="Search by job title, company, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Location
          </label>
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Job Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="">All Types</option>
            <option value="full time">Full Time</option>
            <option value="part time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {filteredJobs.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '3rem',
            color: '#6b7280'
          }}>
            <IoBriefcaseOutline style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {job.title}
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  {job.company}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <IoLocationOutline />
                  <span>{job.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <IoTimeOutline />
                  <span>{job.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <IoStarOutline />
                  <span>{job.salary}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ 
                  color: '#374151',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {job.description}
                </p>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                      }}>
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                      }}>
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={() => navigate(`/jobs/${job._id}`)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                View & Apply
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowseJobs;
