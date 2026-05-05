import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business Details
    businessName: '',
    businessTagline: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessPincode: '',
    
    // Tax Details
    gstNumber: '',
    panNumber: ''
  });

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.businessName || !formData.businessPhone) {
      setError('Business name and phone are required');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        {
          businessName: formData.businessName,
          businessTagline: formData.businessTagline,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail || formData.email,
          businessAddress: formData.businessAddress,
          businessCity: formData.businessCity,
          businessState: formData.businessState,
          businessPincode: formData.businessPincode,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber
        }
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: step === 2 ? '600px' : '450px' }}>
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Step 1: Personal Information' : 'Step 2: Business Details'}
        </p>

        {/* Progress Indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            flex: 1, 
            height: '4px', 
            background: step >= 1 ? 'var(--primary)' : 'var(--border)',
            borderRadius: '2px'
          }}></div>
          <div style={{ 
            flex: 1, 
            height: '4px', 
            background: step >= 2 ? 'var(--primary)' : 'var(--border)',
            borderRadius: '2px'
          }}></div>
        </div>

        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginBottom: '1rem', 
            textAlign: 'center',
            padding: '0.75rem',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input 
                  type="password" 
                  name="password"
                  className="form-input" 
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  className="form-input" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required 
                />
              </div>

              <button type="button" onClick={handleNext} className="btn">
                Next: Business Details →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label>Business Name *</label>
                  <input 
                    type="text" 
                    name="businessName"
                    className="form-input" 
                    value={formData.businessName} 
                    onChange={handleChange}
                    placeholder="Your Furniture Business"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Business Phone *</label>
                  <input 
                    type="tel" 
                    name="businessPhone"
                    className="form-input" 
                    value={formData.businessPhone} 
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Business Tagline</label>
                <input 
                  type="text" 
                  name="businessTagline"
                  className="form-input" 
                  value={formData.businessTagline} 
                  onChange={handleChange}
                  placeholder="Quality Furniture Solutions"
                />
              </div>

              <div className="form-group">
                <label>Business Email</label>
                <input 
                  type="email" 
                  name="businessEmail"
                  className="form-input" 
                  value={formData.businessEmail} 
                  onChange={handleChange}
                  placeholder="business@email.com (optional)"
                />
              </div>

              <div className="form-group">
                <label>Business Address</label>
                <textarea 
                  name="businessAddress"
                  className="form-input" 
                  value={formData.businessAddress} 
                  onChange={handleChange}
                  placeholder="Street address"
                  rows="2"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="businessCity"
                    className="form-input" 
                    value={formData.businessCity} 
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="businessState"
                    className="form-input" 
                    value={formData.businessState} 
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Pincode</label>
                  <input 
                    type="text" 
                    name="businessPincode"
                    className="form-input" 
                    value={formData.businessPincode} 
                    onChange={handleChange}
                    placeholder="123456"
                  />
                </div>

                <div className="form-group">
                  <label>GST Number</label>
                  <input 
                    type="text" 
                    name="gstNumber"
                    className="form-input" 
                    value={formData.gstNumber} 
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>PAN Number</label>
                <input 
                  type="text" 
                  name="panNumber"
                  className="form-input" 
                  value={formData.panNumber} 
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="btn-outline"
                  style={{ flex: 1 }}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

// Made with Bob
