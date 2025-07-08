import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/jobs`);
        const data = await response.json();
        if (data.success) {
          const foundJob = data.jobs.find(j => j._id === id);
          setJob(foundJob);
        } else {
          setError('Failed to fetch job');
        }
      } catch (err) {
        setError('Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApplied(true);
    // Here you could send the application to the backend if needed
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!job) return <div>Job not found.</div>;

  return (
    <div className="job-detail-container">
      <h2>{job.title}</h2>
      <p><strong>Company:</strong> {job.company}</p>
      {job.companyWebsite && (
        <p><strong>Website:</strong> <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer">{job.companyWebsite}</a></p>
      )}
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Type:</strong> {job.type}</p>
      <p><strong>Salary:</strong> {job.salary}</p>
      <p><strong>Description:</strong></p>
      <p>{job.description}</p>
      <p><strong>Requirements:</strong></p>
      <p>{job.requirements}</p>
      <div style={{marginTop: '2rem'}}>
        <h3>Apply for this job</h3>
        {applied ? (
          <div style={{color: 'green', marginTop: '1rem'}}>Application submitted successfully!</div>
        ) : (
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400}}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={applied}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={applied}
            />
            <textarea
              name="message"
              placeholder="Message (optional)"
              value={form.message}
              onChange={handleChange}
              rows={4}
              disabled={applied}
            />
            <button type="submit" className="apply-btn" disabled={applied}>Apply</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobDetail; 