import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyTagline: '',
    companyPhone: '',
    companyAddress: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || '',
        companyTagline: user.companyTagline || '',
        companyPhone: user.companyPhone || '',
        companyAddress: user.companyAddress || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h2 className="card-title">Company Profile Settings</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Update your company details here. This information will appear on the PDF bills you generate.
        </p>

        {message && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem', 
            borderRadius: '8px', 
            backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : '#991b1b',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input 
              type="text" 
              name="companyName"
              className="form-input" 
              value={formData.companyName} 
              onChange={handleChange} 
              placeholder="e.g. KUMAWAT ENTERPRISES"
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Company Tagline / Subtitle</label>
            <input 
              type="text" 
              name="companyTagline"
              className="form-input" 
              value={formData.companyTagline} 
              onChange={handleChange} 
              placeholder="e.g. Interior & Furniture Specialists"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              name="companyPhone"
              className="form-input" 
              value={formData.companyPhone} 
              onChange={handleChange} 
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea 
              name="companyAddress"
              className="form-input" 
              value={formData.companyAddress} 
              onChange={handleChange} 
              rows="3"
              placeholder="e.g. 123 Wood Street, Mumbai"
            />
          </div>

          <button type="submit" className="btn">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
