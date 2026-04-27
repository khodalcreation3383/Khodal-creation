const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const generateBillPDF = (bill, settings, payments = []) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `Invoice ${bill.billNumber}`,
          Author: settings.businessName || 'Textile Business',
          Subject: 'Invoice'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = 595.28; // A4 width in points
      const H = 841.89; // A4 height in points
      const margin = 30;
      const contentWidth = W - margin * 2;

      // ─── COLOR PALETTE ───────────────────────────────────────────────
      const PRIMARY = '#1a237e';      // Deep indigo
      const PRIMARY_LIGHT = '#3949ab';
      const ACCENT = '#e8eaf6';       // Light indigo bg
      const TEXT_DARK = '#1a1a2e';
      const TEXT_MED = '#4a4a6a';
      const TEXT_LIGHT = '#8888aa';
      const BORDER = '#c5cae9';
      const SUCCESS = '#2e7d32';
      const WHITE = '#ffffff';
      const ROW_ALT = '#f8f9ff';
      const HEADER_BG = '#1a237e';

      let y = 0;

      // ─── HEADER BAND ─────────────────────────────────────────────────
      doc.rect(0, 0, W, 130).fill(PRIMARY);

      // Logo area
      const getLogoPath = () => {
        if (!settings.logo) return null;
        if (process.env.NODE_ENV === 'production') {
          // In production, files are in /tmp/uploads
          const filename = settings.logo.split('/').pop();
          return `/tmp/uploads/logos/${filename}`;
        }
        return path.join(__dirname, '../../', settings.logo);
      };
      const logoPath = getLogoPath();
      const logoExists = logoPath && fs.existsSync(logoPath);

      if (logoExists) {
        try {
          doc.image(logoPath, margin, 15, { width: 75, height: 75, fit: [75, 75] });
        } catch (e) {
          // fallback initials
          doc.circle(margin + 35, 55, 35).fill(PRIMARY_LIGHT);
          doc.fontSize(22).fillColor(WHITE).font('Helvetica-Bold')
            .text((settings.businessName || 'KC').substring(0, 2).toUpperCase(), margin + 20, 43);
        }
      } else {
        // Initials placeholder
        doc.circle(margin + 35, 55, 35).fill(PRIMARY_LIGHT);
        doc.fontSize(22).fillColor(WHITE).font('Helvetica-Bold')
          .text((settings.businessName || 'KC').substring(0, 2).toUpperCase(), margin + 20, 43);
      }

      // Business name & details
      const bizX = margin + 85;
      doc.fontSize(20).fillColor(WHITE).font('Helvetica-Bold')
        .text(settings.businessName || 'Khodal Creation', bizX, 22, { width: 280 });

      const addr = settings.address || {};
      const addrLine = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
      doc.fontSize(8.5).fillColor('#c5cae9').font('Helvetica')
        .text(addrLine || 'Your Business Address', bizX, 46, { width: 280 });

      const contact = settings.contact || {};
      const contactLine = [contact.phone || contact.mobile, contact.email].filter(Boolean).join('  |  ');
      doc.fontSize(8.5).fillColor('#c5cae9')
        .text(contactLine || '', bizX, 58, { width: 280 });

      if (settings.gst?.number) {
        doc.fontSize(8).fillColor('#9fa8da')
          .text(`GSTIN: ${settings.gst.number}`, bizX, 70, { width: 280 });
      }

      // INVOICE label (right side)
      doc.fontSize(28).fillColor(WHITE).font('Helvetica-Bold')
        .text('INVOICE', W - margin - 130, 22, { width: 130, align: 'right' });
      doc.fontSize(9).fillColor('#9fa8da').font('Helvetica')
        .text(`# ${bill.billNumber}`, W - margin - 130, 56, { width: 130, align: 'right' });

      // ─── INVOICE META STRIP ──────────────────────────────────────────
      y = 130;
      doc.rect(0, y, W, 50).fill(ACCENT);

      const metaItems = [
        { label: 'Invoice Date', value: formatDate(bill.billDate) },
        { label: 'Due Date', value: formatDate(bill.dueDate) },
        { label: 'Status', value: (bill.status || 'pending').toUpperCase() },
        { label: 'Payment Terms', value: `${bill.party?.paymentTermsDays || 30} Days` }
      ];

      const metaW = contentWidth / metaItems.length;
      metaItems.forEach((item, i) => {
        const mx = margin + i * metaW;
        doc.fontSize(7.5).fillColor(TEXT_LIGHT).font('Helvetica')
          .text(item.label.toUpperCase(), mx, y + 10, { width: metaW - 10 });
        
        let valueColor = TEXT_DARK;
        if (item.label === 'Status') {
          if (bill.status === 'paid') valueColor = SUCCESS;
          else if (bill.status === 'overdue') valueColor = '#c62828';
          else if (bill.status === 'partial') valueColor = '#e65100';
          else valueColor = '#1565c0';
        }
        doc.fontSize(10).fillColor(valueColor).font('Helvetica-Bold')
          .text(item.value, mx, y + 22, { width: metaW - 10 });
      });

      // ─── BILL TO / FROM ──────────────────────────────────────────────
      y = 195;
      const halfW = (contentWidth - 20) / 2;

      // Bill To box
      doc.rect(margin, y, halfW, 90).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.rect(margin, y, halfW, 20).fill(PRIMARY_LIGHT);
      doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
        .text('BILL TO', margin + 10, y + 6);

      const party = bill.party || {};
      const partyAddr = party.address || {};
      doc.fontSize(11).fillColor(TEXT_DARK).font('Helvetica-Bold')
        .text(party.name || 'N/A', margin + 10, y + 26, { width: halfW - 20 });
      doc.fontSize(8.5).fillColor(TEXT_MED).font('Helvetica');
      let partyY = y + 40;
      if (party.mobile) { doc.text(`📞 ${party.mobile}`, margin + 10, partyY, { width: halfW - 20 }); partyY += 12; }
      const pAddrLine = [partyAddr.street, partyAddr.city, partyAddr.state, partyAddr.pincode].filter(Boolean).join(', ');
      if (pAddrLine) { doc.text(pAddrLine, margin + 10, partyY, { width: halfW - 20 }); partyY += 12; }
      if (party.gstNumber) { doc.text(`GSTIN: ${party.gstNumber}`, margin + 10, partyY, { width: halfW - 20 }); }

      // Payment Summary box
      const psX = margin + halfW + 20;
      doc.rect(psX, y, halfW, 90).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.rect(psX, y, halfW, 20).fill(PRIMARY_LIGHT);
      doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
        .text('PAYMENT SUMMARY', psX + 10, y + 6);

      const psData = [
        { label: 'Grand Total', value: formatCurrency(bill.grandTotal), bold: true },
        { label: 'Amount Paid', value: formatCurrency(bill.paidAmount), color: SUCCESS },
        { label: 'Balance Due', value: formatCurrency(bill.pendingAmount), color: bill.pendingAmount > 0 ? '#c62828' : SUCCESS }
      ];
      psData.forEach((item, i) => {
        const psY = y + 28 + i * 18;
        doc.fontSize(8.5).fillColor(TEXT_MED).font('Helvetica').text(item.label, psX + 10, psY);
        doc.fontSize(item.bold ? 10 : 8.5)
          .fillColor(item.color || TEXT_DARK)
          .font(item.bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(item.value, psX + 10, psY, { width: halfW - 20, align: 'right' });
      });

      // ─── ITEMS TABLE ─────────────────────────────────────────────────
      y = 300;

      // Table header
      const cols = [
        { label: '#', width: 25, align: 'center' },
        { label: 'Design No.', width: 75, align: 'left' },
        { label: 'Description', width: 155, align: 'left' },
        { label: 'Fabric', width: 70, align: 'left' },
        { label: 'Qty', width: 35, align: 'center' },
        { label: 'Rate (₹)', width: 65, align: 'right' },
        { label: 'GST%', width: 40, align: 'center' },
        { label: 'Amount (₹)', width: 70, align: 'right' }
      ];

      // Draw header
      doc.rect(margin, y, contentWidth, 22).fill(HEADER_BG);
      let colX = margin;
      cols.forEach(col => {
        doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
          .text(col.label, colX + 4, y + 7, { width: col.width - 8, align: col.align });
        colX += col.width;
      });

      y += 22;

      // Table rows
      const items = bill.items || [];
      items.forEach((item, idx) => {
        const rowH = 28;
        const isAlt = idx % 2 === 1;
        doc.rect(margin, y, contentWidth, rowH).fill(isAlt ? ROW_ALT : WHITE);

        // Row border
        doc.rect(margin, y, contentWidth, rowH).strokeColor(BORDER).lineWidth(0.3).stroke();

        colX = margin;
        const rowData = [
          { value: String(idx + 1), align: 'center' },
          { value: item.designNumber || 'N/A', align: 'left' },
          { value: item.designName || item.fabricType || 'N/A', align: 'left' },
          { value: item.fabricType || '-', align: 'left' },
          { value: String(item.quantity || 0), align: 'center' },
          { value: (item.pricePerPiece || 0).toFixed(2), align: 'right' },
          { value: bill.gstEnabled ? `${item.gstRate || 0}%` : '-', align: 'center' },
          { value: (item.totalAmount || 0).toFixed(2), align: 'right' }
        ];

        cols.forEach((col, ci) => {
          doc.fontSize(8.5).fillColor(TEXT_DARK).font('Helvetica')
            .text(rowData[ci].value, colX + 4, y + 9, { width: col.width - 8, align: rowData[ci].align });
          colX += col.width;
        });

        y += rowH;
      });

      // ─── TOTALS SECTION ──────────────────────────────────────────────
      y += 5;
      const totalsX = margin + contentWidth - 200;
      const totalsW = 200;

      const totalsData = [
        { label: 'Subtotal', value: formatCurrency(bill.subtotal) },
        ...(bill.gstEnabled ? [{ label: `GST`, value: formatCurrency(bill.totalGst) }] : []),
        { label: 'Grand Total', value: formatCurrency(bill.grandTotal), highlight: true },
        { label: 'Amount Paid', value: formatCurrency(bill.paidAmount), color: SUCCESS },
        { label: 'Balance Due', value: formatCurrency(bill.pendingAmount), color: bill.pendingAmount > 0 ? '#c62828' : SUCCESS, bold: true }
      ];

      totalsData.forEach((row, i) => {
        const rowH = row.highlight ? 24 : 18;
        if (row.highlight) {
          doc.rect(totalsX, y, totalsW, rowH).fill(PRIMARY);
          doc.fontSize(10).fillColor(WHITE).font('Helvetica-Bold')
            .text(row.label, totalsX + 10, y + 7, { width: 90 })
            .text(row.value, totalsX + 10, y + 7, { width: totalsW - 20, align: 'right' });
        } else {
          doc.rect(totalsX, y, totalsW, rowH).fill(i % 2 === 0 ? ROW_ALT : WHITE)
            .strokeColor(BORDER).lineWidth(0.3).stroke();
          doc.fontSize(9).fillColor(row.color || TEXT_MED).font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
            .text(row.label, totalsX + 10, y + 4, { width: 90 })
            .text(row.value, totalsX + 10, y + 4, { width: totalsW - 20, align: 'right' });
        }
        y += rowH;
      });

      // ─── PAYMENT HISTORY ─────────────────────────────────────────────
      if (payments && payments.length > 0) {
        y += 15;
        doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
          .text('PAYMENT HISTORY', margin, y);
        y += 15;

        doc.rect(margin, y, contentWidth, 18).fill(PRIMARY_LIGHT);
        doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
          .text('Date', margin + 5, y + 5, { width: 80 })
          .text('Method', margin + 90, y + 5, { width: 80 })
          .text('Reference', margin + 175, y + 5, { width: 120 })
          .text('Amount', margin + 300, y + 5, { width: contentWidth - 310, align: 'right' });
        y += 18;

        payments.forEach((pmt, i) => {
          const rowH = 16;
          doc.rect(margin, y, contentWidth, rowH).fill(i % 2 === 0 ? ROW_ALT : WHITE)
            .strokeColor(BORDER).lineWidth(0.2).stroke();
          const methodLabel = { cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque', upi: 'UPI', other: 'Other' };
          const ref = pmt.chequeNumber || pmt.transactionId || pmt.upiRef || '-';
          doc.fontSize(8).fillColor(TEXT_DARK).font('Helvetica')
            .text(formatDate(pmt.paymentDate), margin + 5, y + 4, { width: 80 })
            .text(methodLabel[pmt.method] || pmt.method, margin + 90, y + 4, { width: 80 })
            .text(ref, margin + 175, y + 4, { width: 120 })
            .text(formatCurrency(pmt.amount), margin + 300, y + 4, { width: contentWidth - 310, align: 'right' });
          y += rowH;
        });
      }

      // ─── NOTES & TERMS ───────────────────────────────────────────────
      y += 15;
      if (bill.notes) {
        doc.fontSize(9).fillColor(PRIMARY).font('Helvetica-Bold').text('Notes:', margin, y);
        y += 12;
        doc.fontSize(8.5).fillColor(TEXT_MED).font('Helvetica').text(bill.notes, margin, y, { width: contentWidth });
        y += 20;
      }

      const terms = bill.termsAndConditions || settings.invoice?.termsAndConditions || 'Thank you for your business!';
      doc.fontSize(9).fillColor(PRIMARY).font('Helvetica-Bold').text('Terms & Conditions:', margin, y);
      y += 12;
      doc.fontSize(8).fillColor(TEXT_MED).font('Helvetica').text(terms, margin, y, { width: contentWidth });

      // ─── FOOTER ──────────────────────────────────────────────────────
      const footerY = H - 50;
      const currentYear = new Date().getFullYear();
      doc.rect(0, footerY, W, 50).fill(PRIMARY);
      doc.fontSize(8).fillColor('#9fa8da').font('Helvetica')
        .text(settings.invoice?.footer || 'This is a computer-generated invoice. No signature required.', margin, footerY + 10, { width: contentWidth, align: 'center' });
      doc.fontSize(7.5).fillColor('#7986cb')
        .text(`Generated on ${formatDate(new Date())} | © ${currentYear} ${settings.businessName || 'Khodal Creation'}`, margin, footerY + 25, { width: contentWidth, align: 'center' });

      // Signature line
      doc.moveTo(W - margin - 120, footerY - 30).lineTo(W - margin, footerY - 30)
        .strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.fontSize(7.5).fillColor(TEXT_LIGHT).font('Helvetica')
        .text('Authorized Signature', W - margin - 120, footerY - 20, { width: 120, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateBillPDF };
