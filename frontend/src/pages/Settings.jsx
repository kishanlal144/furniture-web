import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Save } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    businessTagline: user?.businessTagline || '',
    businessPhone: user?.businessPhone || '',
    businessEmail: user?.businessEmail || '',
    businessAddress: user?.businessAddress || '',
    businessCity: user?.businessCity || '',
    businessState: user?.businessState || '',
    businessPincode: user?.businessPincode || '',
    businessCountry: user?.businessCountry || 'India',
    gstNumber: user?.gstNumber || '',
    panNumber: user?.panNumber || '',
    bankName: user?.bankName || '',
    accountNumber: user?.accountNumber || '',
    ifscCode: user?.ifscCode || '',
    website: user?.website || '',
    termsAndConditions: user?.termsAndConditions || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await updateProfile(formData);
      setMessage('Settings updated successfully!');
    } catch (err) {
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <div className="navbar-brand">Business Settings</div>
      </nav>

      <main className="dashboard-content">
        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: '8px',
            background: message.includes('success') ? '#d1fae5' : '#fee2e2',
            color: message.includes('success') ? '#065f46' : '#991b1b',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h3 className="card-title">Business Information</h3>
            
            <div className="grid-2">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  className="form-input"
                  value={formData.businessName}
                  onChange={handleChange}
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

            <div className="grid-2">
              <div className="form-group">
                <label>Business Email</label>
                <input
                  type="email"
                  name="businessEmail"
                  className="form-input"
                  value={formData.businessEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  className="form-input"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Business Address</h3>
            
            <div className="form-group">
              <label>Street Address</label>
              <textarea
                name="businessAddress"
                className="form-input"
                value={formData.businessAddress}
                onChange={handleChange}
                rows="2"
                placeholder="Street address, building number"
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
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="businessCountry"
                  className="form-input"
                  value={formData.businessCountry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Tax & Legal Information</h3>
            
            <div className="grid-2">
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
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Bank Details</h3>
            
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                className="form-input"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="State Bank of India"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  className="form-input"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  className="form-input"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="SBIN0001234"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Terms & Conditions</h3>
            
            <div className="form-group">
              <label>Default Terms & Conditions for Invoices</label>
              <textarea
                name="termsAndConditions"
                className="form-input"
                value={formData.termsAndConditions}
                onChange={handleChange}
                rows="4"
                placeholder="Enter your default terms and conditions..."
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Settings;

// Made with Bob
