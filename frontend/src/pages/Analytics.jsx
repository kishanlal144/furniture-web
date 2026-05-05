import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, FileText, AlertCircle } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/bills/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <nav className="navbar">
          <div className="navbar-brand">Analytics</div>
        </nav>
        <main className="dashboard-content">
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading analytics...</p>
        </main>
      </div>
    );
  }

  const overall = stats?.overall || {};
  const monthly = stats?.monthly || [];

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <div className="navbar-brand">Analytics & Reports</div>
      </nav>

      <main className="dashboard-content">
        <h2 style={{ marginBottom: '1.5rem' }}>Business Overview</h2>
        
        <div className="grid-3">
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{parseFloat(overall.total_revenue || 0).toLocaleString()}</div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(79, 70, 229, 0.1)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={24} color="var(--primary)" />
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div className="stat-label">Total Paid</div>
                <div className="stat-value">₹{parseFloat(overall.total_paid || 0).toLocaleString()}</div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} color="var(--secondary)" />
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div className="stat-label">Pending Amount</div>
                <div className="stat-value">₹{parseFloat(overall.total_pending || 0).toLocaleString()}</div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle size={24} color="var(--danger)" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '2rem' }}>
          <div className="card">
            <h3 className="card-title">Bills Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>Total Bills</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{overall.total_bills || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#d1fae5', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#065f46' }}>Paid Bills</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#065f46' }}>{overall.paid_bills || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#92400e' }}>Partial Paid</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#92400e' }}>{overall.partial_bills || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#991b1b' }}>Pending Bills</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#991b1b' }}>{overall.pending_bills || 0}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Monthly Revenue (Last 12 Months)</h3>
            {monthly.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {monthly.slice(0, 6).map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--background)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.bills_count} bills</div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--secondary)' }}>
                      ₹{parseFloat(item.revenue || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="card-title">Key Metrics</h3>
          <div className="grid-3">
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--background)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {overall.total_bills ? Math.round((overall.paid_bills / overall.total_bills) * 100) : 0}%
              </div>
              <div style={{ color: 'var(--text-muted)' }}>Collection Rate</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--background)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                ₹{overall.total_bills ? Math.round(overall.total_revenue / overall.total_bills).toLocaleString() : 0}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>Avg Bill Value</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--background)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                {monthly.length > 0 ? monthly[0].bills_count : 0}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>This Month's Bills</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;

// Made with Bob
