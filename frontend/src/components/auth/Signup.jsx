import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoBriefcaseOutline } from 'react-icons/io5';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signup(formData.name, formData.email, formData.password, formData.role);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join TalentTrek and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <IoPersonOutline className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="  Full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <IoMailOutline className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="  Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <IoLockClosedOutline className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="  Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <IoLockClosedOutline className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="  Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <IoBriefcaseOutline className="input-icon" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="auth-input"
              >
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the{' '}
              <Link to="/terms" className="auth-link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="auth-link">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="social-auth">
          <button className="social-button google">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
            Continue with Google
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 