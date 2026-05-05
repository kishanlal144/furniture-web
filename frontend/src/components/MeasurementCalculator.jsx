import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { generatePDF } from '../utils/pdfExport';
import { Download, Plus, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MeasurementCalculator = ({ onBillCreated }) => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  // Current Item State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [rate, setRate] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [taxRate, setTaxRate] = useState('18');
  
  // Bill State
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState('0');

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    
    if (customerId && customerId !== 'new') {
      const customer = customers.find(c => c.id === parseInt(customerId));
      if (customer) {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone || '');
        setCustomerAddress(customer.address || '');
      }
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }
  };

  const handleProductChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    if (val && val !== 'custom') {
      const product = products.find(p => p.id === parseInt(val));
      if (product) {
        setRate(product.rate_per_sqft);
        setTaxRate(product.tax_rate || '18');
      }
    } else {
      setRate('');
      setTaxRate('18');
    }
  };

  const calculateSqFt = (l, w) => {
    return (parseFloat(l) * parseFloat(w)) / 144;
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProduct || !length || !width || !rate) return;
    if (selectedProduct === 'custom' && !customItemName) return;

    let productName = '';
    let productId = null;
    let hsnCode = '';

    if (selectedProduct === 'custom') {
      productName = customItemName;
    } else {
      const product = products.find(p => p.id === parseInt(selectedProduct));
      productName = product.name;
      productId = product.id;
      hsnCode = product.hsn_code || '';
    }

    const sqFt = calculateSqFt(length, width);
    const amount = sqFt * parseFloat(rate);
    const taxAmount = (amount * parseFloat(taxRate)) / 100;

    const newItem = {
      product_id: productId,
      product_name: productName,
      catalogName: productName, // For backward compatibility
      length: parseFloat(length),
      width: parseFloat(width),
      sqft: sqFt,
      rate: parseFloat(rate),
      amount: amount,
      tax_rate: parseFloat(taxRate),
      tax_amount: taxAmount,
      hsn_code: hsnCode
    };

    setItems([...items, newItem]);
    
    // Reset current item form
    setLength('');
    setWidth('');
    if (selectedProduct === 'custom') {
      setCustomItemName('');
    }
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const totalTax = items.reduce((acc, item) => acc + item.tax_amount, 0);
  const discountAmount = parseFloat(discount) || 0;
  const totalAmount = subtotal + totalTax - discountAmount;

  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveAndGenerate = async () => {
    if (!customerName.trim()) {
      setErrorMsg("Please enter a Customer Name before saving.");
      return;
    }
    if (items.length === 0) {
      setErrorMsg("Please add at least one item to the bill.");
      return;
    }
    
    setErrorMsg('');

    try {
      // Save to database
      const billData = {
        customer_id: selectedCustomer && selectedCustomer !== 'new' ? parseInt(selectedCustomer) : null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: items,
        discount_amount: discountAmount,
        bill_date: new Date().toISOString().split('T')[0]
      };

      const res = await axios.post('http://localhost:5000/api/bills', billData);
      const savedBill = res.data;

      console.log('Saved bill:', savedBill); // Debug log

      // Generate PDF with the saved bill data
      const companyInfo = {
        companyName: user?.businessName || 'My Furniture Business',
        companyTagline: user?.businessTagline || 'Quality Furniture Solutions',
        companyPhone: user?.businessPhone || '',
        companyEmail: user?.businessEmail || user?.email || '',
        companyAddress: user?.businessAddress || '',
        companyCity: user?.businessCity || '',
        companyState: user?.businessState || '',
        companyPincode: user?.businessPincode || '',
        gstNumber: user?.gstNumber || '',
        panNumber: user?.panNumber || '',
        bankName: user?.bankName || '',
        accountNumber: user?.accountNumber || '',
        ifscCode: user?.ifscCode || ''
      };
      
      // Ensure the bill has all required fields for PDF generation
      const billForPDF = {
        ...savedBill,
        items: savedBill.items || [],
        customer_name: savedBill.customer_name || customerName,
        bill_date: savedBill.bill_date || new Date(),
        invoice_number: savedBill.invoice_number || 'INV-DRAFT'
      };

      console.log('Generating PDF with:', billForPDF); // Debug log
      generatePDF(billForPDF, companyInfo);
      
      if(onBillCreated) onBillCreated();
    } catch (err) {
      console.error('Error saving/generating bill:', err);
      alert('Failed to save bill: ' + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">Customer Details</h3>
        
        <div className="form-group">
          <label>Select Customer</label>
          <select 
            className="form-input" 
            value={selectedCustomer} 
            onChange={handleCustomerChange}
          >
            <option value="">-- Select Existing Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
            ))}
            <option value="new">+ New Customer</option>
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Customer Name *</label>
            <input 
              type="text" 
              className="form-input" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              placeholder="Enter customer name..."
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="form-input" 
              value={customerPhone} 
              onChange={(e) => setCustomerPhone(e.target.value)} 
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Address</label>
          <textarea 
            className="form-input" 
            value={customerAddress} 
            onChange={(e) => setCustomerAddress(e.target.value)} 
            placeholder="Customer address..."
            rows="2"
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Add Item</h3>
          <form onSubmit={handleAddItem}>
            <div className="form-group">
              <label>Select Product</label>
              <select 
                className="form-input" 
                value={selectedProduct} 
                onChange={handleProductChange}
                required
              >
                <option value="">-- Select Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.rate_per_sqft}/sqft)</option>
                ))}
                <option value="custom">Custom Item</option>
              </select>
            </div>

            {selectedProduct === 'custom' && (
              <div className="form-group">
                <label>Custom Item Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={customItemName} 
                  onChange={(e) => setCustomItemName(e.target.value)} 
                  required 
                  placeholder="e.g. Center Table"
                />
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label>Rate (₹ / Sq.Ft)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={rate} 
                  onChange={(e) => setRate(e.target.value)} 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={taxRate} 
                  onChange={(e) => setTaxRate(e.target.value)} 
                  required 
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Length (Inches)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={length} 
                  onChange={(e) => setLength(e.target.value)} 
                  required 
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Width (Inches)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={width} 
                  onChange={(e) => setWidth(e.target.value)} 
                  required 
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            
            {length && width && selectedProduct && rate && (
              <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Area:</span>
                  <strong>{calculateSqFt(length, width).toFixed(2)} Sq.Ft</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Amount:</span>
                  <strong>₹{(calculateSqFt(length, width) * parseFloat(rate)).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax ({taxRate}%):</span>
                  <strong className="text-green">
                    ₹{((calculateSqFt(length, width) * parseFloat(rate) * parseFloat(taxRate)) / 100).toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Add to Bill
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">Bill Summary</h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No items added yet.</p>
          ) : (
            <>
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Amount</th>
                      <th>Tax</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.length}" x {item.width}" ({item.sqft.toFixed(2)} sqft)
                          </div>
                        </td>
                        <td>₹{item.amount.toFixed(0)}</td>
                        <td>₹{item.tax_amount.toFixed(0)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Tax:</span>
                  <strong>₹{totalTax.toFixed(2)}</strong>
                </div>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label>Discount (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={discount} 
                    onChange={(e) => setDiscount(e.target.value)} 
                    min="0"
                    step="0.01"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid var(--border)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span className="text-green">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {errorMsg && (
                <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontWeight: '500', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  {errorMsg}
                </div>
              )}

              <button 
                onClick={handleSaveAndGenerate} 
                className="btn" 
                style={{ background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Download size={18} /> Save & Download Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementCalculator;

// Made with Bob
