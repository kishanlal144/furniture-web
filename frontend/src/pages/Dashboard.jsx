import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { LogOut, Plus, Download, TrendingUp, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MeasurementCalculator from '../components/MeasurementCalculator';
import { generatePDF } from '../utils/pdfExport';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bills');
      setBills(res.data.slice(0, 5)); // Show only last 5 bills
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bills/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBillCreated = () => {
    fetchBills();
    fetchStats();
    setShowCalculator(false);
  };

  const handleStatusChange = async (billId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bills/${billId}`, {
        payment_status: newStatus
      });
      
      // Refresh both bills and stats after status change
      await fetchBills();
      await fetchStats();
      
      alert('Payment status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDownload = (bill) => {
    const companyInfo = {
      companyName: user?.businessName || 'My Furniture Business',
      companyTagline: user?.businessTagline || 'Quality Furniture Solutions',
      companyPhone: user?.businessPhone || '',
      companyAddress: user?.businessAddress || '',
      companyCity: user?.businessCity || '',
      companyState: user?.businessState || '',
      companyPincode: user?.businessPincode || '',
      gstNumber: user?.gstNumber || '',
      panNumber: user?.panNumber || ''
    };
    generatePDF(bill, companyInfo);
  };

  const overall = stats?.overall || {};

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <div className="navbar-brand">{user?.businessName || 'Furniture Web'}</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={logout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {showCalculator ? (
          <div>
            <button className="btn-outline" onClick={() => setShowCalculator(false)} style={{ marginBottom: '1rem', width: 'auto' }}>
              ← Back to Dashboard
            </button>
            <MeasurementCalculator onBillCreated={handleBillCreated} />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0 }}>Dashboard</h2>
              <button className="btn" onClick={() => setShowCalculator(true)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> New Bill
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">₹{parseFloat(overall.total_revenue || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    background: 'rgba(79, 70, 229, 0.1)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <DollarSign size={28} color="var(--primary)" />
                  </div>
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="stat-label">Total Paid</div>
                    <div className="stat-value">₹{parseFloat(overall.total_paid || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <TrendingUp size={28} color="var(--secondary)" />
                  </div>
                </div>
              </div>

              <div className="stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="stat-label">Pending Amount</div>
                    <div className="stat-value">₹{parseFloat(overall.total_pending || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <AlertCircle size={28} color="var(--danger)" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bills */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="card-title" style={{ marginBottom: 0 }}>Recent Bills</h3>
                <Link to="/bills" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
                  View All →
                </Link>
              </div>
              {bills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No bills generated yet.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "New Bill" to create your first invoice</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => (
                        <tr key={bill.id}>
                          <td><strong>{bill.invoice_number}</strong></td>
                          <td>{new Date(bill.bill_date).toLocaleDateString('en-IN')}</td>
                          <td>{bill.customer_name}</td>
                          <td className="text-green">₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}</td>
                          <td>
                            <select
                              value={bill.payment_status}
                              onChange={(e) => handleStatusChange(bill.id, e.target.value)}
                              className={`badge ${
                                bill.payment_status === 'paid' ? 'badge-success' :
                                bill.payment_status === 'partial' ? 'badge-warning' : 'badge-danger'
                              }`}
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.875rem'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDownload(bill)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--primary)', 
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--background)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                              title="Download PDF"
                            >
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

// Made with Bob
