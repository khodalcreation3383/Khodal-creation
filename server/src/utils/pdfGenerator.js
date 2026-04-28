const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

const formatCurrency = (amount) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
  // Replace ₹ symbol with Rs. for better PDF compatibility
  return formatted.replace('₹', 'Rs. ');
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Fetch image from URL (for Cloudinary logos)
const fetchImageBuffer = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    // If it's a local path, skip
    if (!url.startsWith('http')) return resolve(null);

    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
};

const generateBillPDF = async (bill, settings, payments = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `Invoice ${bill.billNumber}`,
          Author: settings.businessName || 'Khodal Creation',
          Subject: 'Invoice'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = 595.28;
      const H = 841.89;
      const M = 36; // margin
      const CW = W - M * 2; // content width

      // ── PALETTE ──────────────────────────────────────────────────────
      const C = {
        primary:    '#111827',   // near-black
        accent:     '#4F46E5',   // indigo
        accentDark: '#3730A3',
        accentLight:'#EEF2FF',
        accentMid:  '#C7D2FE',
        success:    '#059669',
        danger:     '#DC2626',
        warning:    '#D97706',
        textDark:   '#111827',
        textMed:    '#374151',
        textLight:  '#6B7280',
        textFaint:  '#9CA3AF',
        border:     '#E5E7EB',
        borderMid:  '#D1D5DB',
        rowAlt:     '#F9FAFB',
        white:      '#FFFFFF',
        bgLight:    '#F3F4F6',
      };

      // ── FETCH LOGO ────────────────────────────────────────────────────
      let logoBuffer = null;
      if (settings.logo) {
        if (settings.logo.startsWith('http')) {
          logoBuffer = await fetchImageBuffer(settings.logo);
        }
      }

      let y = 0;

      // ═══════════════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════════════
      const headerH = 120;
      doc.rect(0, 0, W, headerH).fill(C.accent);

      // Subtle diagonal stripe pattern
      doc.save();
      doc.rect(0, 0, W, headerH).clip();
      doc.opacity(0.06);
      for (let i = -headerH; i < W + headerH; i += 18) {
        doc.moveTo(i, 0).lineTo(i + headerH, headerH)
          .strokeColor(C.white).lineWidth(8).stroke();
      }
      doc.restore();

      // Logo circle / image
      const logoSize = 64;
      const logoX = M;
      const logoY = (headerH - logoSize) / 2;

      if (logoBuffer) {
        try {
          // White circle behind logo
          doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 3)
            .fill(C.white);
          doc.image(logoBuffer, logoX, logoY, { width: logoSize, height: logoSize, fit: [logoSize, logoSize] });
        } catch {
          drawInitials();
        }
      } else {
        drawInitials();
      }

      function drawInitials() {
        doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
          .fill(C.accentDark);
        const initials = (settings.businessName || 'KC').substring(0, 2).toUpperCase();
        doc.fontSize(22).fillColor(C.white).font('Helvetica-Bold')
          .text(initials, logoX, logoY + logoSize / 2 - 13, { width: logoSize, align: 'center' });
      }

      // Business info
      const bizX = M + logoSize + 16;
      const bizW = W / 2 - bizX + M;
      doc.fontSize(18).fillColor(C.white).font('Helvetica-Bold')
        .text(settings.businessName || 'Khodal Creation', bizX, logoY + 4, { width: bizW });

      const addr = settings.address || {};
      const addrParts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
      if (addrParts.length) {
        doc.fontSize(8).fillColor(C.accentMid).font('Helvetica')
          .text(addrParts.join(', '), bizX, logoY + 28, { width: bizW });
      }

      const contact = settings.contact || {};
      const contactParts = [contact.phone || contact.mobile, contact.email].filter(Boolean);
      if (contactParts.length) {
        doc.fontSize(8).fillColor(C.accentMid)
          .text(contactParts.join('   ·   '), bizX, logoY + 40, { width: bizW });
      }

      if (settings.gst?.number) {
        doc.fontSize(7.5).fillColor(C.accentMid)
          .text(`GSTIN: ${settings.gst.number}`, bizX, logoY + 52, { width: bizW });
      }

      // INVOICE label (right)
      const invX = W / 2 + 10;
      const invW = W - M - invX;
      doc.fontSize(32).fillColor(C.white).font('Helvetica-Bold')
        .text('INVOICE', invX, logoY + 2, { width: invW, align: 'right' });
      doc.fontSize(10).fillColor(C.accentMid).font('Helvetica')
        .text(`# ${bill.billNumber}`, invX, logoY + 40, { width: invW, align: 'right' });

      // Status badge on header
      const statusColors = {
        paid: '#059669', partial: '#D97706', pending: '#4F46E5',
        overdue: '#DC2626', cancelled: '#6B7280'
      };
      const statusBg = statusColors[bill.status] || C.accent;
      const statusLabel = (bill.status || 'PENDING').toUpperCase();
      const badgeW = 70;
      const badgeH = 20;
      const badgeX = W - M - badgeW;
      const badgeY = logoY + 62;
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4).fill(statusBg);
      doc.fontSize(8).fillColor(C.white).font('Helvetica-Bold')
        .text(statusLabel, badgeX, badgeY + 6, { width: badgeW, align: 'center' });

      y = headerH;

      // ═══════════════════════════════════════════════════════════════
      // META STRIP
      // ═══════════════════════════════════════════════════════════════
      const metaH = 44;
      doc.rect(0, y, W, metaH).fill(C.accentLight);

      // Thin accent line at top of meta strip
      doc.rect(0, y, W, 2).fill(C.accent);

      const metaItems = [
        { label: 'Invoice Date', value: formatDate(bill.billDate) },
        { label: 'Due Date',     value: formatDate(bill.dueDate) },
        { label: 'Payment Terms', value: `${bill.party?.paymentTermsDays || 30} Days` },
        { label: 'Items',        value: `${(bill.items || []).length} item${(bill.items || []).length !== 1 ? 's' : ''}` },
      ];

      const metaColW = CW / metaItems.length;
      metaItems.forEach((item, i) => {
        const mx = M + i * metaColW;
        doc.fontSize(7).fillColor(C.textFaint).font('Helvetica')
          .text(item.label.toUpperCase(), mx, y + 8, { width: metaColW - 8 });
        doc.fontSize(9.5).fillColor(C.textDark).font('Helvetica-Bold')
          .text(item.value, mx, y + 19, { width: metaColW - 8 });
      });

      y += metaH + 16;

      // ═══════════════════════════════════════════════════════════════
      // BILL TO + PAYMENT SUMMARY
      // ═══════════════════════════════════════════════════════════════
      const boxH = 95;
      const halfW = (CW - 14) / 2;

      // ── Bill To ──
      doc.roundedRect(M, y, halfW, boxH, 6).fill(C.white)
        .roundedRect(M, y, halfW, boxH, 6).strokeColor(C.border).lineWidth(0.5).stroke();

      // Accent left bar
      doc.roundedRect(M, y, 4, boxH, 2).fill(C.accent);

      doc.fontSize(7).fillColor(C.accent).font('Helvetica-Bold')
        .text('BILL TO', M + 12, y + 10);

      const party = bill.party || {};
      const partyAddr = party.address || {};
      doc.fontSize(12).fillColor(C.textDark).font('Helvetica-Bold')
        .text(party.name || 'N/A', M + 12, y + 22, { width: halfW - 24 });

      let pyy = y + 38;
      doc.fontSize(8.5).fillColor(C.textMed).font('Helvetica');
      if (party.mobile) {
        doc.text(`Phone: ${party.mobile}`, M + 12, pyy, { width: halfW - 24 });
        pyy += 13;
      }
      const pAddrLine = [partyAddr.street, partyAddr.city, partyAddr.state].filter(Boolean).join(', ');
      if (pAddrLine) {
        doc.text(pAddrLine, M + 12, pyy, { width: halfW - 24 });
        pyy += 13;
      }
      if (party.gstNumber) {
        doc.fontSize(7.5).fillColor(C.textLight)
          .text(`GSTIN: ${party.gstNumber}`, M + 12, pyy, { width: halfW - 24 });
      }

      // ── Payment Summary ──
      const psX = M + halfW + 14;
      doc.roundedRect(psX, y, halfW, boxH, 6).fill(C.white)
        .roundedRect(psX, y, halfW, boxH, 6).strokeColor(C.border).lineWidth(0.5).stroke();
      doc.roundedRect(psX, y, 4, boxH, 2).fill(C.accent);

      doc.fontSize(7).fillColor(C.accent).font('Helvetica-Bold')
        .text('PAYMENT SUMMARY', psX + 12, y + 10);

      const summaryRows = [
        { label: 'Grand Total',  value: formatCurrency(bill.grandTotal),    bold: true,  color: C.textDark },
        { label: 'Amount Paid',  value: formatCurrency(bill.paidAmount),    bold: false, color: C.success },
        { label: 'Balance Due',  value: formatCurrency(bill.pendingAmount), bold: true,  color: bill.pendingAmount > 0 ? C.danger : C.success },
      ];

      summaryRows.forEach((row, i) => {
        const ry = y + 24 + i * 20;
        const isLast = i === summaryRows.length - 1;
        if (isLast) {
          doc.roundedRect(psX + 8, ry - 3, halfW - 16, 18, 3)
            .fill(bill.pendingAmount > 0 ? '#FEF2F2' : '#ECFDF5');
        }
        doc.fontSize(8.5).fillColor(C.textLight).font('Helvetica')
          .text(row.label, psX + 12, ry, { width: halfW / 2 - 10 });
        doc.fontSize(row.bold ? 10 : 8.5).fillColor(row.color)
          .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(row.value, psX + 12, ry, { width: halfW - 24, align: 'right' });
      });

      y += boxH + 18;

      // ═══════════════════════════════════════════════════════════════
      // ITEMS TABLE
      // ═══════════════════════════════════════════════════════════════
      const cols = [
        { label: '#',          w: 22,  align: 'center' },
        { label: 'Design No.', w: 72,  align: 'left'   },
        { label: 'Description',w: 148, align: 'left'   },
        { label: 'Fabric',     w: 68,  align: 'left'   },
        { label: 'Qty',        w: 32,  align: 'center' },
        { label: 'Rate',       w: 62,  align: 'right'  },
        ...(bill.gstEnabled ? [{ label: 'GST%', w: 38, align: 'center' }] : []),
        { label: 'Amount',     w: 68,  align: 'right'  },
      ];

      // Recalculate to fill full width
      const totalColW = cols.reduce((s, c) => s + c.w, 0);
      const scale = CW / totalColW;
      cols.forEach(c => { c.w = Math.floor(c.w * scale); });

      // Table header
      const thH = 26;
      doc.roundedRect(M, y, CW, thH, 4).fill(C.accent);
      let cx = M;
      cols.forEach(col => {
        doc.fontSize(7.5).fillColor(C.white).font('Helvetica-Bold')
          .text(col.label, cx + 5, y + 9, { width: col.w - 10, align: col.align });
        cx += col.w;
      });
      y += thH;

      // Rows
      const items = bill.items || [];
      items.forEach((item, idx) => {
        const rowH = 26;
        const isAlt = idx % 2 === 1;
        doc.rect(M, y, CW, rowH).fill(isAlt ? C.rowAlt : C.white);
        doc.rect(M, y, CW, rowH).strokeColor(C.border).lineWidth(0.3).stroke();

        cx = M;
        const rowData = [
          { v: String(idx + 1),                                    a: 'center' },
          { v: item.designNumber || '—',                           a: 'left'   },
          { v: item.designName || item.color || '—',               a: 'left'   },
          { v: item.fabricType || '—',                             a: 'left'   },
          { v: String(item.quantity || 0),                         a: 'center' },
          { v: `Rs. ${(item.pricePerPiece || 0).toFixed(2)}`,        a: 'right'  },
          ...(bill.gstEnabled ? [{ v: `${item.gstRate || 0}%`, a: 'center' }] : []),
          { v: `Rs. ${(item.totalAmount || 0).toFixed(2)}`,          a: 'right'  },
        ];

        cols.forEach((col, ci) => {
          const isAmount = ci === cols.length - 1;
          doc.fontSize(8.5)
            .fillColor(isAmount ? C.textDark : C.textMed)
            .font(isAmount ? 'Helvetica-Bold' : 'Helvetica')
            .text(rowData[ci].v, cx + 5, y + 8, { width: col.w - 10, align: rowData[ci].a });
          cx += col.w;
        });

        y += rowH;
      });

      // Bottom border of table
      doc.moveTo(M, y).lineTo(M + CW, y).strokeColor(C.borderMid).lineWidth(0.5).stroke();

      // ═══════════════════════════════════════════════════════════════
      // TOTALS
      // ═══════════════════════════════════════════════════════════════
      y += 10;
      const totW = 210;
      const totX = M + CW - totW;

      const totals = [
        { label: 'Subtotal',     value: formatCurrency(bill.subtotal),      highlight: false },
        ...(bill.gstEnabled ? [{ label: 'GST',  value: formatCurrency(bill.totalGst), highlight: false }] : []),
        { label: 'Grand Total',  value: formatCurrency(bill.grandTotal),    highlight: true  },
        { label: 'Amount Paid',  value: formatCurrency(bill.paidAmount),    color: C.success },
        { label: 'Balance Due',  value: formatCurrency(bill.pendingAmount), color: bill.pendingAmount > 0 ? C.danger : C.success, bold: true },
      ];

      totals.forEach((row) => {
        const rh = row.highlight ? 26 : 20;
        if (row.highlight) {
          doc.roundedRect(totX, y, totW, rh, 4).fill(C.accent);
          doc.fontSize(10).fillColor(C.white).font('Helvetica-Bold')
            .text(row.label, totX + 10, y + 8, { width: totW / 2 - 10 })
            .text(row.value, totX + 10, y + 8, { width: totW - 20, align: 'right' });
        } else {
          doc.rect(totX, y, totW, rh).fill(C.white)
            .strokeColor(C.border).lineWidth(0.3).stroke();
          doc.fontSize(9).fillColor(row.color || C.textMed)
            .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
            .text(row.label, totX + 10, y + 5, { width: totW / 2 - 10 })
            .text(row.value, totX + 10, y + 5, { width: totW - 20, align: 'right' });
        }
        y += rh;
      });

      // ═══════════════════════════════════════════════════════════════
      // PAYMENT HISTORY
      // ═══════════════════════════════════════════════════════════════
      if (payments && payments.length > 0) {
        y += 18;
        // Section title
        doc.fontSize(9).fillColor(C.accent).font('Helvetica-Bold')
          .text('PAYMENT HISTORY', M, y);
        doc.moveTo(M, y + 13).lineTo(M + CW, y + 13)
          .strokeColor(C.accentMid).lineWidth(0.5).stroke();
        y += 18;

        // Header
        doc.rect(M, y, CW, 20).fill(C.accentLight);
        doc.fontSize(7.5).fillColor(C.accent).font('Helvetica-Bold')
          .text('Date',      M + 6,       y + 6, { width: 80 })
          .text('Method',    M + 90,      y + 6, { width: 80 })
          .text('Reference', M + 175,     y + 6, { width: 130 })
          .text('Amount',    M + 310,     y + 6, { width: CW - 316, align: 'right' });
        y += 20;

        payments.forEach((pmt, i) => {
          const rh = 17;
          doc.rect(M, y, CW, rh).fill(i % 2 === 0 ? C.white : C.rowAlt)
            .strokeColor(C.border).lineWidth(0.2).stroke();
          const methodMap = { cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque', upi: 'UPI', other: 'Other' };
          const ref = pmt.chequeNumber || pmt.transactionId || pmt.upiRef || '—';
          doc.fontSize(8).fillColor(C.textMed).font('Helvetica')
            .text(formatDate(pmt.paymentDate), M + 6,   y + 4, { width: 80 })
            .text(methodMap[pmt.method] || pmt.method,  M + 90,  y + 4, { width: 80 })
            .text(ref,                                   M + 175, y + 4, { width: 130 });
          doc.fontSize(8).fillColor(C.success).font('Helvetica-Bold')
            .text(formatCurrency(pmt.amount), M + 310, y + 4, { width: CW - 316, align: 'right' });
          y += rh;
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // NOTES & TERMS
      // ═══════════════════════════════════════════════════════════════
      y += 16;

      if (bill.notes) {
        doc.roundedRect(M, y, CW, 1, 0).fill(C.border);
        y += 8;
        doc.fontSize(8).fillColor(C.accent).font('Helvetica-Bold').text('NOTES', M, y);
        y += 12;
        doc.fontSize(8.5).fillColor(C.textMed).font('Helvetica')
          .text(bill.notes, M, y, { width: CW });
        y += 20;
      }

      const terms = bill.termsAndConditions || settings.invoice?.termsAndConditions || 'Thank you for your business!';
      doc.roundedRect(M, y, CW, 1, 0).fill(C.border);
      y += 8;
      doc.fontSize(8).fillColor(C.accent).font('Helvetica-Bold').text('TERMS & CONDITIONS', M, y);
      y += 12;
      doc.fontSize(8).fillColor(C.textLight).font('Helvetica')
        .text(terms, M, y, { width: CW });

      // ═══════════════════════════════════════════════════════════════
      // SIGNATURE LINE
      // ═══════════════════════════════════════════════════════════════
      const sigY = H - 90;
      doc.moveTo(W - M - 130, sigY).lineTo(W - M, sigY)
        .strokeColor(C.borderMid).lineWidth(0.5).stroke();
      doc.fontSize(7.5).fillColor(C.textFaint).font('Helvetica')
        .text('Authorized Signature', W - M - 130, sigY + 5, { width: 130, align: 'center' });

      // ═══════════════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════════════
      doc.rect(0, H - 50, W, 50).fill(C.primary);

      // Accent line at top of footer
      doc.rect(0, H - 50, W, 3).fill(C.accent);

      doc.fontSize(8).fillColor('#9CA3AF').font('Helvetica')
        .text(
          settings.invoice?.footer || 'This is a computer-generated invoice. No signature required.',
          M, H - 38, { width: CW, align: 'center' }
        );
      doc.fontSize(7.5).fillColor('#6B7280')
        .text(
          `Generated on ${formatDate(new Date())}   ·   © ${new Date().getFullYear()} ${settings.businessName || 'Khodal Creation'}`,
          M, H - 24, { width: CW, align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateBillPDF };
