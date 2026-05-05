import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Download, Plus, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import MeasurementCalculator from '../components/MeasurementCalculator';
import { generatePDF } from '../utils/pdfExport';

const Bills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [filter]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get('http://localhost:5000/api/bills', { params });
      setBills(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBillCreated = () => {
    fetchBills();
    setShowCalculator(false);
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

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'badge-success',
      pending: 'badge-danger',
      partial: 'badge-warning'
    };
    return `badge ${badges[status] || 'badge-warning'}`;
  };

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <div className="navbar-brand">Bills & Invoices</div>
      </nav>

      <main className="dashboard-content">
        {showCalculator ? (
          <div>
            <button className="btn-outline" onClick={() => setShowCalculator(false)} style={{ marginBottom: '1rem', width: 'auto' }}>
              ← Back to Bills
            </button>
            <MeasurementCalculator onBillCreated={handleBillCreated} />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className={filter === 'all' ? 'btn' : 'btn-outline'}
                  onClick={() => setFilter('all')}
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  All
                </button>
                <button 
                  className={filter === 'paid' ? 'btn' : 'btn-outline'}
                  onClick={() => setFilter('paid')}
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  Paid
                </button>
                <button 
                  className={filter === 'pending' ? 'btn' : 'btn-outline'}
                  onClick={() => setFilter('pending')}
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  Pending
                </button>
                <button 
                  className={filter === 'partial' ? 'btn' : 'btn-outline'}
                  onClick={() => setFilter('partial')}
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  Partial
                </button>
              </div>
              
              <button 
                className="btn" 
                onClick={() => setShowCalculator(true)} 
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> New Bill
              </button>
            </div>

            <div className="card">
              <h3 className="card-title">All Bills</h3>
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading...</p>
              ) : bills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No bills found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total Amount</th>
                        <th>Paid</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => (
                        <tr key={bill.id}>
                          <td><strong>{bill.invoice_number}</strong></td>
                          <td>{new Date(bill.bill_date).toLocaleDateString()}</td>
                          <td>{bill.customer_name}</td>
                          <td className="text-green">₹{parseFloat(bill.total_amount).toLocaleString()}</td>
                          <td>₹{parseFloat(bill.paid_amount || 0).toLocaleString()}</td>
                          <td>
                            <span className={getStatusBadge(bill.payment_status)}>
                              {bill.payment_status}
                            </span>
                          </td>
                          <td>{bill.items?.length || 0} items</td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDownload(bill)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--primary)', 
                                cursor: 'pointer',
                                padding: '0.5rem'
                              }}
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

export default Bills;

// Made with Bob
