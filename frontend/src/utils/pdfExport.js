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
    let yPos = 15;

    // Header with Company Info
    doc.setFillColor(79, 70, 229);
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
    doc.setTextColor(79, 70, 229);
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
    const tableColumn = ["#", "Item Description", "Dimensions", "Area", "Rate", "Amount", "Tax", "Total"];
    const tableRows = [];

    const items = bill.items || [];
    items.forEach((item, index) => {
      const dimensions = item.length && item.width ? `${item.length}" × ${item.width}"` : '-';
      const area = item.sqft || item.sqFt ? `${(item.sqft || item.sqFt).toFixed(2)} sqft` : '-';
      const rate = `₹${parseFloat(item.rate).toFixed(2)}`;
      const amount = `₹${parseFloat(item.amount || item.price).toFixed(2)}`;
      const tax = item.tax_amount ? `₹${parseFloat(item.tax_amount).toFixed(2)}` : '₹0.00';
      const total = item.tax_amount 
        ? `₹${(parseFloat(item.amount || item.price) + parseFloat(item.tax_amount)).toFixed(2)}`
        : amount;

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
      theme: 'striped',
      headStyles: { 
        fillColor: [79, 70, 229], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 18, halign: 'right' },
        7: { cellWidth: 23, halign: 'right' }
      }
    });

    // Summary Box
    const finalY = doc.lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 70;
    const summaryWidth = 56;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(summaryX, finalY, summaryWidth, 35, 'F');
    
    let summaryY = finalY + 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', summaryX + 3, summaryY);
    doc.text(`₹${subtotal.toFixed(2)}`, summaryX + summaryWidth - 3, summaryY, { align: 'right' });
    
    summaryY += 6;
    doc.text('Tax:', summaryX + 3, summaryY);
    doc.text(`₹${totalTax.toFixed(2)}`, summaryX + summaryWidth - 3, summaryY, { align: 'right' });
    
    if (discount > 0) {
      summaryY += 6;
      doc.text('Discount:', summaryX + 3, summaryY);
      doc.text(`-₹${discount.toFixed(2)}`, summaryX + summaryWidth - 3, summaryY, { align: 'right' });
    }
    
    summaryY += 8;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(summaryX + 3, summaryY - 2, summaryX + summaryWidth - 3, summaryY - 2);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text('Grand Total:', summaryX + 3, summaryY);
    doc.text(`₹${grandTotal.toFixed(2)}`, summaryX + summaryWidth - 3, summaryY, { align: 'right' });

    // Payment Status
    if (bill.payment_status) {
      summaryY += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const statusColor = bill.payment_status === 'paid' ? [16, 185, 129] : 
                         bill.payment_status === 'partial' ? [245, 158, 11] : [239, 68, 68];
      doc.setTextColor(...statusColor);
      doc.text(`Status: ${bill.payment_status.toUpperCase()}`, summaryX + 3, summaryY);
    }

    // Bank Details (if available)
    let bankY = finalY + 45;
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

    // Terms & Conditions
    const termsY = doc.internal.pageSize.height - 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 14, termsY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = bill.terms || companyInfo.termsAndConditions || 
      '1. Payment is due within 30 days.\n2. Please make checks payable to the company name.\n3. All sales are final.';
    const termsLines = doc.splitTextToSize(terms, pageWidth - 28);
    doc.text(termsLines, 14, termsY + 5);

    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(14, doc.internal.pageSize.height - 20, pageWidth - 14, doc.internal.pageSize.height - 20);
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.height - 12, { align: 'center' });
    
    doc.setFontSize(7);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, doc.internal.pageSize.height - 7, { align: 'center' });

    // Generate filename
    const safeCustomerName = String(bill.customer_name || 'Customer').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const invoiceNum = bill.invoice_number || 'INV';
    const finalName = `${invoiceNum}_${safeCustomerName}.pdf`;

    // Download
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Error generating PDF: " + error.message);
  }
};

// Made with Bob
