const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0).toFixed(2);
  const parts = num.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `Rs. ${intPart}.${parts[1]}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

// Fetch image buffer from Cloudinary URL
const fetchImageBuffer = (url) => {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(null);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', () => resolve(null));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
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

      const W  = 595.28;
      const H  = 841.89;
      const M  = 40;
      const CW = W - M * 2;

      // ── COLOR PALETTE (Navy #022363 based) ───────────────────────
      const C = {
        navy:       '#022363',   // primary brand color
        navyDark:   '#011540',   // darker navy for footer
        navyMid:    '#0a3a8a',   // mid navy
        navyLight:  '#d6e4f7',   // very light navy tint
        navyFaint:  '#eef4fc',   // faintest navy tint
        gold:       '#c8a84b',   // accent gold for highlights
        white:      '#ffffff',
        textDark:   '#0d1b2a',
        textMed:    '#2c3e50',
        textLight:  '#5d6d7e',
        textFaint:  '#95a5a6',
        border:     '#dce8f5',
        borderMid:  '#b8cfe8',
        rowAlt:     '#f5f9ff',
        success:    '#1a7a4a',
        danger:     '#c0392b',
      };

      // ── FETCH LOGO ────────────────────────────────────────────────
      let logoBuffer = null;
      if (settings.logo) {
        logoBuffer = await fetchImageBuffer(settings.logo);
      }

      let y = 0;

      // ═══════════════════════════════════════════════════════════════
      // HEADER  (solid navy background)
      // ═══════════════════════════════════════════════════════════════
      const headerH = 115;
      doc.rect(0, 0, W, headerH).fill(C.navy);

      // Thin gold accent line at bottom of header
      doc.rect(0, headerH - 3, W, 3).fill(C.gold);

      // ── Logo ──
      const logoSize = 68;
      const logoX    = M;
      const logoY    = Math.floor((headerH - 3 - logoSize) / 2);

      if (logoBuffer) {
        try {
          // White rounded square behind logo
          doc.roundedRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 6)
            .fill(C.white);
          doc.image(logoBuffer, logoX, logoY, {
            width: logoSize, height: logoSize, fit: [logoSize, logoSize]
          });
        } catch {
          drawInitials(doc, C, logoX, logoY, logoSize);
        }
      } else {
        drawInitials(doc, C, logoX, logoY, logoSize);
      }

      // ── Business name & details ──
      const bizX = M + logoSize + 18;
      const bizW = W * 0.52 - bizX;

      doc.fontSize(17).fillColor(C.white).font('Helvetica-Bold')
        .text(settings.businessName || 'Khodal Creation', bizX, logoY + 2, { width: bizW });

      const addr    = settings.address || {};
      const addrStr = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
      if (addrStr) {
        doc.fontSize(8).fillColor(C.navyLight).font('Helvetica')
          .text(addrStr, bizX, logoY + 24, { width: bizW });
      }

      const contact     = settings.contact || {};
      const contactStr  = [contact.phone || contact.mobile, contact.email].filter(Boolean).join('   |   ');
      if (contactStr) {
        doc.fontSize(8).fillColor(C.navyLight)
          .text(contactStr, bizX, logoY + 36, { width: bizW });
      }

      if (settings.gst?.number) {
        doc.fontSize(7.5).fillColor(C.navyLight)
          .text(`GSTIN: ${settings.gst.number}`, bizX, logoY + 48, { width: bizW });
      }

      // ── INVOICE label (right side) ──
      const invX = W * 0.62;
      const invW = W - M - invX;

      doc.fontSize(30).fillColor(C.white).font('Helvetica-Bold')
        .text('INVOICE', invX, logoY + 2, { width: invW, align: 'right' });

      doc.fontSize(9).fillColor(C.navyLight).font('Helvetica')
        .text(`No.  ${bill.billNumber}`, invX, logoY + 38, { width: invW, align: 'right' });

      // Status pill
      const statusMap = {
        paid:      { bg: '#1a7a4a', label: 'PAID'      },
        partial:   { bg: '#b7770d', label: 'PARTIAL'   },
        pending:   { bg: '#0a3a8a', label: 'PENDING'   },
        overdue:   { bg: '#c0392b', label: 'OVERDUE'   },
        cancelled: { bg: '#5d6d7e', label: 'CANCELLED' },
      };
      const st     = statusMap[bill.status] || statusMap.pending;
      const pillW  = 72;
      const pillH  = 18;
      const pillX  = W - M - pillW;
      const pillY  = logoY + 60;
      doc.roundedRect(pillX, pillY, pillW, pillH, 9).fill(st.bg);
      doc.fontSize(7.5).fillColor(C.white).font('Helvetica-Bold')
        .text(st.label, pillX, pillY + 5, { width: pillW, align: 'center' });

      y = headerH;

      // ═══════════════════════════════════════════════════════════════
      // META STRIP  (light navy tint)
      // ═══════════════════════════════════════════════════════════════
      const metaH = 42;
      doc.rect(0, y, W, metaH).fill(C.navyFaint);

      const metaItems = [
        { label: 'Invoice Date',   value: formatDate(bill.billDate) },
        { label: 'Due Date',       value: formatDate(bill.dueDate)  },
        { label: 'Payment Terms',  value: `${bill.party?.paymentTermsDays || 30} Days` },
        { label: 'Total Items',    value: `${(bill.items || []).length}` },
      ];

      const mColW = CW / metaItems.length;
      metaItems.forEach((item, i) => {
        const mx = M + i * mColW;
        // Vertical divider (except first)
        if (i > 0) {
          doc.moveTo(mx, y + 8).lineTo(mx, y + metaH - 8)
            .strokeColor(C.border).lineWidth(0.5).stroke();
        }
        doc.fontSize(6.5).fillColor(C.textFaint).font('Helvetica')
          .text(item.label.toUpperCase(), mx + 8, y + 8, { width: mColW - 16 });
        doc.fontSize(9.5).fillColor(C.textDark).font('Helvetica-Bold')
          .text(item.value, mx + 8, y + 19, { width: mColW - 16 });
      });

      y += metaH + 18;

      // ═══════════════════════════════════════════════════════════════
      // BILL TO  +  PAYMENT SUMMARY
      // ═══════════════════════════════════════════════════════════════
      const boxH  = 92;
      const halfW = (CW - 12) / 2;

      // ── Bill To ──
      doc.rect(M, y, halfW, boxH).fill(C.white)
        .rect(M, y, halfW, boxH).strokeColor(C.border).lineWidth(0.5).stroke();
      // Navy top bar
      doc.rect(M, y, halfW, 20).fill(C.navy);
      doc.fontSize(7.5).fillColor(C.white).font('Helvetica-Bold')
        .text('BILL TO', M + 10, y + 6);

      const party     = bill.party || {};
      const partyAddr = party.address || {};
      doc.fontSize(11).fillColor(C.textDark).font('Helvetica-Bold')
        .text(party.name || 'N/A', M + 10, y + 26, { width: halfW - 20 });

      let py = y + 42;
      doc.fontSize(8.5).fillColor(C.textMed).font('Helvetica');
      if (party.mobile) {
        doc.text(`Phone: ${party.mobile}`, M + 10, py, { width: halfW - 20 }); py += 12;
      }
      const pAddr = [partyAddr.street, partyAddr.city, partyAddr.state].filter(Boolean).join(', ');
      if (pAddr) {
        doc.text(pAddr, M + 10, py, { width: halfW - 20 }); py += 12;
      }
      if (party.gstNumber) {
        doc.fontSize(7.5).fillColor(C.textLight)
          .text(`GSTIN: ${party.gstNumber}`, M + 10, py, { width: halfW - 20 });
      }

      // ── Payment Summary ──
      const psX = M + halfW + 12;
      doc.rect(psX, y, halfW, boxH).fill(C.white)
        .rect(psX, y, halfW, boxH).strokeColor(C.border).lineWidth(0.5).stroke();
      doc.rect(psX, y, halfW, 20).fill(C.navy);
      doc.fontSize(7.5).fillColor(C.white).font('Helvetica-Bold')
        .text('PAYMENT SUMMARY', psX + 10, y + 6);

      const sumRows = [
        { label: 'Grand Total', value: formatCurrency(bill.grandTotal),    bold: true,  color: C.textDark },
        { label: 'Amount Paid', value: formatCurrency(bill.paidAmount),    bold: false, color: C.success  },
        { label: 'Balance Due', value: formatCurrency(bill.pendingAmount), bold: true,
          color: bill.pendingAmount > 0 ? C.danger : C.success },
      ];

      sumRows.forEach((row, i) => {
        const ry = y + 26 + i * 20;
        if (i === sumRows.length - 1) {
          doc.rect(psX + 6, ry - 2, halfW - 12, 18)
            .fill(bill.pendingAmount > 0 ? '#fdf0ef' : '#edf7f1');
        }
        doc.fontSize(8.5).fillColor(C.textLight).font('Helvetica')
          .text(row.label, psX + 10, ry, { width: halfW / 2 });
        doc.fontSize(row.bold ? 10 : 8.5).fillColor(row.color)
          .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(row.value, psX + 10, ry, { width: halfW - 20, align: 'right' });
      });

      y += boxH + 18;

      // ═══════════════════════════════════════════════════════════════
      // ITEMS TABLE
      // ═══════════════════════════════════════════════════════════════
      const baseCols = [
        { label: '#',           w: 20,  align: 'center' },
        { label: 'Design No.',  w: 70,  align: 'left'   },
        { label: 'Description', w: 150, align: 'left'   },
        { label: 'Fabric',      w: 65,  align: 'left'   },
        { label: 'Qty',         w: 30,  align: 'center' },
        { label: 'Rate',        w: 60,  align: 'right'  },
        ...(bill.gstEnabled ? [{ label: 'GST%', w: 36, align: 'center' }] : []),
        { label: 'Amount',      w: 65,  align: 'right'  },
      ];

      // Scale columns to fill exact content width
      const rawTotal = baseCols.reduce((s, c) => s + c.w, 0);
      const sc       = CW / rawTotal;
      const cols     = baseCols.map(c => ({ ...c, w: Math.floor(c.w * sc) }));
      // Fix rounding: add remainder to last col
      const colTotal = cols.reduce((s, c) => s + c.w, 0);
      cols[cols.length - 1].w += CW - colTotal;

      // Table header row
      const thH = 24;
      doc.rect(M, y, CW, thH).fill(C.navy);
      let cx = M;
      cols.forEach(col => {
        doc.fontSize(7.5).fillColor(C.white).font('Helvetica-Bold')
          .text(col.label, cx + 4, y + 8, { width: col.w - 8, align: col.align });
        cx += col.w;
      });
      y += thH;

      // Item rows
      (bill.items || []).forEach((item, idx) => {
        const rowH = 25;
        doc.rect(M, y, CW, rowH).fill(idx % 2 === 0 ? C.white : C.rowAlt);
        doc.rect(M, y, CW, rowH).strokeColor(C.border).lineWidth(0.25).stroke();

        cx = M;
        const cells = [
          { v: String(idx + 1),                                  a: 'center' },
          { v: item.designNumber || '-',                         a: 'left'   },
          { v: item.designName || item.color || '-',             a: 'left'   },
          { v: item.fabricType || '-',                           a: 'left'   },
          { v: String(item.quantity || 0),                       a: 'center' },
          { v: formatCurrency(item.pricePerPiece),               a: 'right'  },
          ...(bill.gstEnabled ? [{ v: `${item.gstRate || 0}%`, a: 'center' }] : []),
          { v: formatCurrency(item.totalAmount),                 a: 'right'  },
        ];

        cols.forEach((col, ci) => {
          const isLast = ci === cols.length - 1;
          doc.fontSize(8.5)
            .fillColor(isLast ? C.textDark : C.textMed)
            .font(isLast ? 'Helvetica-Bold' : 'Helvetica')
            .text(cells[ci].v, cx + 4, y + 8, { width: col.w - 8, align: cells[ci].a });
          cx += col.w;
        });

        y += rowH;
      });

      // Table bottom border
      doc.moveTo(M, y).lineTo(M + CW, y).strokeColor(C.borderMid).lineWidth(0.5).stroke();

      // ═══════════════════════════════════════════════════════════════
      // TOTALS BLOCK
      // ═══════════════════════════════════════════════════════════════
      y += 12;
      const totW = 200;
      const totX = M + CW - totW;

      const totRows = [
        { label: 'Subtotal',    value: formatCurrency(bill.subtotal),      hl: false },
        ...(bill.gstEnabled ? [{ label: 'GST', value: formatCurrency(bill.totalGst), hl: false }] : []),
        { label: 'Grand Total', value: formatCurrency(bill.grandTotal),    hl: true  },
        { label: 'Amount Paid', value: formatCurrency(bill.paidAmount),    color: C.success },
        { label: 'Balance Due', value: formatCurrency(bill.pendingAmount),
          color: bill.pendingAmount > 0 ? C.danger : C.success, bold: true },
      ];

      totRows.forEach(row => {
        const rh = row.hl ? 24 : 19;
        if (row.hl) {
          doc.rect(totX, y, totW, rh).fill(C.navy);
          doc.fontSize(10).fillColor(C.white).font('Helvetica-Bold')
            .text(row.label, totX + 10, y + 7, { width: totW / 2 - 10 })
            .text(row.value, totX + 10, y + 7, { width: totW - 20, align: 'right' });
        } else {
          doc.rect(totX, y, totW, rh).fill(C.white)
            .strokeColor(C.border).lineWidth(0.25).stroke();
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
        y += 20;
        doc.fontSize(9).fillColor(C.navy).font('Helvetica-Bold')
          .text('PAYMENT HISTORY', M, y);
        doc.moveTo(M, y + 14).lineTo(M + CW, y + 14)
          .strokeColor(C.borderMid).lineWidth(0.5).stroke();
        y += 20;

        // Header
        doc.rect(M, y, CW, 20).fill(C.navyFaint);
        doc.fontSize(7.5).fillColor(C.navy).font('Helvetica-Bold')
          .text('Date',      M + 6,   y + 6, { width: 80 })
          .text('Method',    M + 90,  y + 6, { width: 80 })
          .text('Reference', M + 175, y + 6, { width: 130 })
          .text('Amount',    M + 310, y + 6, { width: CW - 316, align: 'right' });
        y += 20;

        const methodMap = {
          cash: 'Cash', bank_transfer: 'Bank Transfer',
          cheque: 'Cheque', upi: 'UPI', other: 'Other'
        };

        payments.forEach((pmt, i) => {
          const rh = 17;
          doc.rect(M, y, CW, rh).fill(i % 2 === 0 ? C.white : C.rowAlt)
            .strokeColor(C.border).lineWidth(0.2).stroke();
          const ref = pmt.chequeNumber || pmt.transactionId || pmt.upiRef || '-';
          doc.fontSize(8).fillColor(C.textMed).font('Helvetica')
            .text(formatDate(pmt.paymentDate),          M + 6,   y + 4, { width: 80 })
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
      y += 18;

      if (bill.notes) {
        doc.moveTo(M, y).lineTo(M + CW, y).strokeColor(C.border).lineWidth(0.5).stroke();
        y += 8;
        doc.fontSize(8).fillColor(C.navy).font('Helvetica-Bold').text('NOTES', M, y);
        y += 12;
        doc.fontSize(8.5).fillColor(C.textMed).font('Helvetica')
          .text(bill.notes, M, y, { width: CW });
        y += 18;
      }

      const terms = bill.termsAndConditions
        || settings.invoice?.termsAndConditions
        || 'Thank you for your business!';
      doc.moveTo(M, y).lineTo(M + CW, y).strokeColor(C.border).lineWidth(0.5).stroke();
      y += 8;
      doc.fontSize(8).fillColor(C.navy).font('Helvetica-Bold').text('TERMS & CONDITIONS', M, y);
      y += 12;
      doc.fontSize(8).fillColor(C.textLight).font('Helvetica')
        .text(terms, M, y, { width: CW });

      // ═══════════════════════════════════════════════════════════════
      // SIGNATURE
      // ═══════════════════════════════════════════════════════════════
      const sigY = H - 85;
      doc.moveTo(W - M - 130, sigY).lineTo(W - M, sigY)
        .strokeColor(C.borderMid).lineWidth(0.5).stroke();
      doc.fontSize(7.5).fillColor(C.textFaint).font('Helvetica')
        .text('Authorized Signature', W - M - 130, sigY + 5, { width: 130, align: 'center' });

      // ═══════════════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════════════
      // Gold accent line above footer
      doc.rect(0, H - 48, W, 2).fill(C.gold);
      doc.rect(0, H - 46, W, 46).fill(C.navyDark);

      doc.fontSize(8).fillColor('#8fafd4').font('Helvetica')
        .text(
          settings.invoice?.footer || 'This is a computer-generated invoice. No signature required.',
          M, H - 36, { width: CW, align: 'center' }
        );
      doc.fontSize(7.5).fillColor('#5a7fa8')
        .text(
          `Generated on ${formatDate(new Date())}   |   (c) ${new Date().getFullYear()} ${settings.businessName || 'Khodal Creation'}`,
          M, H - 22, { width: CW, align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper: draw initials circle when no logo
function drawInitials(doc, C, x, y, size) {
  doc.roundedRect(x, y, size, size, 6).fill(C.navyMid);
  const initials = 'KC';
  doc.fontSize(20).fillColor(C.white).font('Helvetica-Bold')
    .text(initials, x, y + size / 2 - 12, { width: size, align: 'center' });
}

module.exports = { generateBillPDF };
