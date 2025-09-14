import React, { useEffect, useState } from 'react'
import "./Home.css"
import bannerImg from "../../assets/job-banner.jpg";
import { FaComputer } from "react-icons/fa6";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoMdPeople } from "react-icons/io";
import { BiSolidShoppingBagAlt } from "react-icons/bi";
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.JOBS);
        const data = await response.json();
        if (data.success) {
          setJobs(data.jobs);
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (err) {
        setError('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleViewAllJobs = () => {
    setShowAll((prev) => !prev);
  };

  const handleSearchJobs = async () => {
    setLoading(true);
    setError(null);
    setShowAll(true); // Show all matching jobs
    setSearchActive(false);
    try {
      let url = API_ENDPOINTS.JOBS;
      const params = [];
      if (searchKeyword) params.push(`keyword=${encodeURIComponent(searchKeyword)}`);
      if (searchLocation) params.push(`location=${encodeURIComponent(searchLocation)}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.jobs);
        setSearchActive(true);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
   <div className="job-banner">
      
      <div className="job-left">
        <h1 className="job-title">
          Find Your Dream Job <br /> Today
        </h1>
        <p className="job-subtitle">
          Connect with top employers and discover opportunities that match your skills and aspirations.
        </p>
        <div className="job-search-fields">
          <input
            type="text"
            placeholder="Job title or keyword"
            className="job-input"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="job-input"
            value={searchLocation}
            onChange={e => setSearchLocation(e.target.value)}
          />
          <button className="job-btn" onClick={handleSearchJobs}>Search Jobs</button>
        </div>
      </div>

      <div className="job-right">
        <img
          src={bannerImg}
          alt="High five in office"
          className="job-image"
        />
      </div>
    </div>

    {/* Search Results Section */}
    {searchActive ? (
      <div className="search-results-container">
        <h2 className="title">Search Results</h2>
        {loading ? (
          <p>Loading jobs...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : searchResults.length === 0 ? (
          <p>No jobs found for your search.</p>
        ) : (
          <div className="job-grid">
            {searchResults.map((job) => (
              <div className="job-card" key={job._id}>
                <div className="job-info">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="company">{job.company}</p>
                    <p className="details">📍 {job.location} &nbsp;&nbsp;|&nbsp;&nbsp; {job.type}</p>
                    <p className="salary">{job.salary}</p>
                  </div>
                </div>
                <Link to={`/jobs/${job._id}`} className="apply-link">Apply Now →</Link>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { setSearchActive(false); setSearchResults([]); setSearchKeyword(""); setSearchLocation(""); }} className="clear-search-btn">Clear Search</button>
      </div>
    ) : (
      <>
        <div className="job-categories-container">
          {/* Top Section */}
          <div className="job-categories-header">
            <h2>Popular Job Categories</h2>
          </div>

          {/* Bottom Section - Category Cards */}
          <div className="job-categories-cards">
            <div className="job-card">
            <FaComputer  className='icon'/>
              <h3>Technology</h3>
              <p>1,543 jobs</p>
            </div>
            <div className="job-card">
            <FaArrowTrendUp className='icon'/>
              <h3>Marketing</h3>
              <p>854 jobs</p>
            </div>
            <div className="job-card">
            <IoMdPeople className='icon'/>
              <h3>Design</h3>
              <p>657 jobs</p>
            </div>
            <div className="job-card">
            <BiSolidShoppingBagAlt className='icon'/>
              <h3>Sales</h3>
              <p>432 jobs</p>
            </div>
          </div>
        </div>
        <div className="job-container">
          <h2 className="title">Featured Job Opportunities</h2>
          {loading ? (
            <p>Loading jobs...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <div className="job-grid">
              {(showAll ? jobs : jobs.slice(0, 6)).map((job) => (
                <div className="job-card" key={job._id}>
                  <div className="job-info">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="company">{job.company}</p>
                      <p className="details">📍 {job.location} &nbsp;&nbsp;|&nbsp;&nbsp; {job.type}</p>
                      <p className="salary">{job.salary}</p>
                    </div>
                  </div>
                  <Link to={`/jobs/${job._id}`} className="apply-link">Apply Now →</Link>
                </div>
              ))}
            </div>
          )}
          <button className="view-btn" onClick={handleViewAllJobs}>
            {showAll ? 'Show Featured Jobs' : 'View All Jobs'}
          </button>
        </div>
      </>
    )}
    </>
  )
}

export default Home