export function downloadReportPDF(report: any) {
  const formatDate = (d: string) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const metrics = report.metrics || {
    totalCases: 0,
    highRiskCases: 0,
    alertsTriggered: 0,
    closedCases: 0,
    caseSample: [],
  };

  const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${report.name} - Nexus AML Report</title>
  <style>
    @media print {
      @page { size: A4; margin: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #0B1F3A;
      margin: 0;
      padding: 32px;
      background: #FFFFFF;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0B1F3A;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #0B1F3A;
      letter-spacing: -0.5px;
    }
    .logo span { color: #C9A227; }
    .doc-type {
      font-size: 11px;
      font-weight: 700;
      color: #4D6A8A;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .title-section {
      margin-bottom: 24px;
    }
    .report-title {
      font-size: 24px;
      font-weight: 700;
      color: #0B1F3A;
      margin: 0 0 6px 0;
    }
    .date-badge {
      display: inline-block;
      background: #EFF6FF;
      color: #1D4ED8;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .meta-item { display: flex; flexDirection: column; }
    .meta-label { color: #64748B; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
    .meta-value { font-weight: 600; color: #0B1F3A; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 14px;
      background: #FFFFFF;
      text-align: center;
    }
    .stat-num { font-size: 22px; font-weight: 700; color: #0B1F3A; margin-bottom: 2px; }
    .stat-lbl { font-size: 11px; color: #64748B; font-weight: 500; }

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #0B1F3A;
      margin-bottom: 12px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 12px;
    }
    th {
      background: #F1F5F9;
      color: #475569;
      text-align: left;
      padding: 8px 12px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #E2E8F0;
      color: #1E293B;
    }
    .risk-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .risk-HIGH { background: #FEE2E2; color: #991B1B; }
    .risk-MEDIUM { background: #FEF3C7; color: #92400E; }
    .risk-LOW { background: #D1FAE5; color: #065F46; }

    .footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94A3B8;
    }
    .toolbar {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 10px;
      background: #0B1F3A;
      padding: 10px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toolbar-btn {
      background: #2E6BFF;
      color: #FFF;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="toolbar-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div class="logo">NEXUS <span>AML</span></div>
    <div class="doc-type">OFFICIAL COMPLIANCE REPORT</div>
  </div>

  <div class="title-section">
    <h1 class="report-title">${report.name}</h1>
    <div class="date-badge">Covered: ${formatDate(report.dateRangeFrom)} – ${formatDate(report.dateRangeTo)}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Report Type</div>
      <div class="meta-value">${report.type}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Generated By</div>
      <div class="meta-value">${report.generatedBy?.name || 'System Admin'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Date Generated</div>
      <div class="meta-value">${formatDate(report.createdAt)}</div>
    </div>
  </div>

  <div class="section-title">Audit Metrics Summary</div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-num">${metrics.totalCases}</div>
      <div class="stat-lbl">Cases Logged</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #DC2626;">${metrics.highRiskCases}</div>
      <div class="stat-lbl">High Risk Flagged</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #D97706;">${metrics.alertsTriggered}</div>
      <div class="stat-lbl">Alerts Triggered</div>
    </div>
    <div class="stat-card">
      <div class="stat-num" style="color: #16A34A;">${metrics.closedCases}</div>
      <div class="stat-lbl">Resolved Cases</div>
    </div>
  </div>

  <div class="section-title">Case Activity Audit Sample</div>
  ${metrics.caseSample && metrics.caseSample.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Case ID</th>
          <th>Entity Name</th>
          <th>Risk Level</th>
          <th>Status</th>
          <th>Created Date</th>
        </tr>
      </thead>
      <tbody>
        ${metrics.caseSample.map((c: any) => `
          <tr>
            <td><strong>${c.caseId}</strong></td>
            <td>${c.entityName}</td>
            <td><span class="risk-pill risk-${c.riskLevel}">${c.riskLevel}</span></td>
            <td>${c.status}</td>
            <td>${formatDate(c.createdAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : `
    <p style="font-size: 13px; color: #64748B; font-style: italic; margin-bottom: 32px;">No individual case records were flagged in this period.</p>
  `}

  <div class="footer">
    <div>Confidential — Internal Compliance Use Only</div>
    <div>Document Reference: ${report.id}</div>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print if desired
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(pdfHtml);
    printWindow.document.close();
  }
}
