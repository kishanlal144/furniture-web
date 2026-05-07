import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (bill, companyInfo = {}) => {
  try {
    const doc = new jsPDF();
    
    const {
      companyName = 'My Furniture Business',
      companyTagline = 'Quality Furniture Solutions',
      companyPhone = '',
      companyEmail = '',
      companyAddress = '',
      companyCity = '',
      companyState = '',
      companyPincode = '',
      gstNumber = '',
      panNumber = '',
      bankName = '',
      accountNumber = '',
      ifscCode = ''
    } = companyInfo;

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 15;

    // Modern gradient-like header with attractive teal/blue color
    doc.setFillColor(20, 184, 166); // Teal-500
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName.toUpperCase(), 14, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (companyTagline) doc.text(companyTagline, 14, yPos);
    
    // Company Contact Info (Right side of header)
    doc.setFontSize(9);
    let rightX = pageWidth - 14;
    let rightY = 15;
    
    if (companyPhone) {
      doc.text(`Phone: ${companyPhone}`, rightX, rightY, { align: 'right' });
      rightY += 5;
    }
    if (companyEmail) {
      doc.text(`Email: ${companyEmail}`, rightX, rightY, { align: 'right' });
      rightY += 5;
    }
    if (gstNumber) {
      doc.text(`GST: ${gstNumber}`, rightX, rightY, { align: 'right' });
      rightY += 5;
    }
    if (panNumber) {
      doc.text(`PAN: ${panNumber}`, rightX, rightY, { align: 'right' });
    }

    // Company Address in header
    yPos += 8;
    doc.setFontSize(8);
    if (companyAddress) {
      doc.text(companyAddress, 14, yPos);
      yPos += 4;
    }
    if (companyCity || companyState || companyPincode) {
      const addressLine = [companyCity, companyState, companyPincode].filter(Boolean).join(', ');
      doc.text(addressLine, 14, yPos);
    }

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 55;

    // Invoice Title and Number
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166); // Teal color
    doc.text('INVOICE', 14, yPos);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${bill.invoice_number || 'N/A'}`, pageWidth - 14, yPos, { align: 'right' });
    
    yPos += 7;
    const invoiceDate = new Date(bill.bill_date || bill.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(9);
    doc.text(`Date: ${invoiceDate}`, pageWidth - 14, yPos, { align: 'right' });

    yPos += 10;

    // Bill To Section
    doc.setFillColor(245, 245, 245);
    doc.rect(14, yPos, pageWidth - 28, 25, 'F');
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 18, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(bill.customer_name || 'Customer', 18, yPos);
    
    yPos += 5;
    doc.setFontSize(9);
    if (bill.customer_phone) {
      doc.text(`Phone: ${bill.customer_phone}`, 18, yPos);
      yPos += 4;
    }
    if (bill.customer_address) {
      const addressLines = doc.splitTextToSize(bill.customer_address, 80);
      doc.text(addressLines, 18, yPos);
      yPos += (addressLines.length * 4);
    }
    if (bill.customer_gst) {
      doc.text(`GST: ${bill.customer_gst}`, 18, yPos);
    }

    yPos += 10;

    // Items Table
    const tableColumn = ["#", "Item Description", "Dimensions", "Area", "Rate/sqft", "Amount", "Tax", "Total"];
    const tableRows = [];

    const items = bill.items || [];
    items.forEach((item, index) => {
      const dimensions = item.length && item.width ? `${item.length}" x ${item.width}"` : '-';
      
      // Safely handle sqft - convert to number and check if valid
      const sqftValue = parseFloat(item.sqft || item.sqFt || 0);
      const area = sqftValue > 0 ? `${sqftValue.toFixed(2)} sqft` : '-';
      
      // Format currency properly without special characters
      const rateValue = parseFloat(item.rate || 0);
      const rate = 'Rs.' + rateValue.toFixed(2);
      
      const amountValue = parseFloat(item.amount || item.price || 0);
      const amount = 'Rs.' + amountValue.toFixed(2);
      
      const taxAmount = parseFloat(item.tax_amount || 0);
      const tax = 'Rs.' + taxAmount.toFixed(2);
      
      const totalValue = amountValue + taxAmount;
      const total = 'Rs.' + totalValue.toFixed(2);

      const itemData = [
        (index + 1).toString(),
        item.product_name || item.catalogName || 'Item',
        dimensions,
        area,
        rate,
        amount,
        tax,
        total
      ];
      tableRows.push(itemData);
    });

    // Calculate totals
    const subtotal = items.reduce((acc, item) => acc + parseFloat(item.amount || item.price || 0), 0);
    const totalTax = items.reduce((acc, item) => acc + parseFloat(item.tax_amount || 0), 0);
    const discount = parseFloat(bill.discount_amount || 0);
    const grandTotal = parseFloat(bill.total_amount || (subtotal + totalTax - discount));

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'grid',
      headStyles: {
        fillColor: [20, 184, 166], // Teal color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        cellPadding: 3
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 24, halign: 'right' },
        6: { cellWidth: 22, halign: 'right' },
        7: { cellWidth: 24, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 14, right: 14 }
    });

    // Summary Section - Enhanced Professional Design
    const finalY = doc.lastAutoTable.finalY + 12;
    const summaryX = pageWidth - 85;
    const summaryWidth = 71;
    const labelX = summaryX + 6;
    const valueX = summaryX + summaryWidth - 6;
    
    // Calculate box height based on discount
    const boxHeight = discount > 0 ? 52 : 44;
    
    // Draw outer border with shadow effect
    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.8);
    doc.rect(summaryX, finalY, summaryWidth, boxHeight, 'S');
    
    // White background for summary rows
    doc.setFillColor(255, 255, 255);
    doc.rect(summaryX, finalY, summaryWidth, boxHeight - 14, 'F');
    
    let summaryY = finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    
    // Subtotal row
    doc.text('Subtotal:', labelX, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Rs. ' + subtotal.toFixed(2), valueX, summaryY, { align: 'right' });
    
    // Tax row
    summaryY += 9;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text('Tax (18%):', labelX, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Rs. ' + totalTax.toFixed(2), valueX, summaryY, { align: 'right' });
    
    // Discount row (if applicable)
    if (discount > 0) {
      summaryY += 9;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      doc.text('Discount:', labelX, summaryY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // Red for discount
      doc.text('-Rs. ' + discount.toFixed(2), valueX, summaryY, { align: 'right' });
    }
    
    // Grand Total row - highlighted with teal background
    summaryY += 11;
    doc.setFillColor(20, 184, 166);
    doc.rect(summaryX, summaryY - 7, summaryWidth, 14, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total:', labelX, summaryY);
    doc.text('Rs. ' + grandTotal.toFixed(2), valueX, summaryY, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Bank Details (if available)
    let bankY = finalY + boxHeight + 10;
    if (bankName || accountNumber || ifscCode) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BANK DETAILS:', 14, bankY);
      
      bankY += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (bankName) {
        doc.text(`Bank: ${bankName}`, 14, bankY);
        bankY += 5;
      }
      if (accountNumber) {
        doc.text(`Account No: ${accountNumber}`, 14, bankY);
        bankY += 5;
      }
      if (ifscCode) {
        doc.text(`IFSC Code: ${ifscCode}`, 14, bankY);
      }
    }

    // Footer (removed Terms & Conditions section)
    const footerY = pageHeight - 25;
    doc.setDrawColor(229, 231, 235);
    doc.line(14, footerY, pageWidth - 14, footerY);
    
    doc.setFontSize(10);
    doc.setTextColor(20, 184, 166);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 8, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, footerY + 14, { align: 'center' });

    // Generate filename
    const safeCustomerName = String(bill.customer_name || 'Customer').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const invoiceNum = bill.invoice_number || 'INV';
    const finalName = `${invoiceNum}_${safeCustomerName}.pdf`;

    // Open PDF in new tab/window for preview and download
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new window/tab
    const newWindow = window.open(pdfUrl, '_blank');
    
    if (!newWindow) {
      // If popup blocked, fallback to direct download
      console.warn('Popup blocked. Falling back to direct download.');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000); // 1 minute delay
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Error generating PDF: " + error.message);
  }
};

// Made with Bob
