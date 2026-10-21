/**
 * A11yOmni - Universal Report & VPAT 2.5 ACR Generator
 * Outputs Accessible Dashboard + Official VPAT 2.5 Conformance Table with PDF/HTML Export
 */

const fs = require('fs');

if (!fs.existsSync('audit-report.json')) {
  console.error('[A11yOmni] Error: audit-report.json not found!');
  process.exit(1);
}

const rawData = fs.readFileSync('audit-report.json', 'utf-8');
const report = JSON.parse(rawData);

const totalChecks = report.summary.passesCount + report.summary.violationsCount;
const score = totalChecks > 0 ? Math.round((report.summary.passesCount / totalChecks) * 100) : 100;

// Standard Core WCAG Criteria for VPAT 2.5 Mapping
const vpatCriteria = [
  { id: '1.1.1', name: 'Non-text Content', level: 'Level A', rules: ['image-alt', 'input-image-alt', 'area-alt'] },
  { id: '1.3.1', name: 'Info and Relationships', level: 'Level A', rules: ['definition-list', 'dlitem', 'list', 'listitem', 'aria-roles', 'heading-order'] },
  { id: '1.3.5', name: 'Identify Input Purpose', level: 'Level AA', rules: ['autocomplete-valid'] },
  { id: '1.4.1', name: 'Use of Color', level: 'Level A', rules: ['color-contrast'] },
  { id: '1.4.3', name: 'Contrast (Minimum)', level: 'Level AA', rules: ['color-contrast'] },
  { id: '1.4.6', name: 'Contrast (Enhanced)', level: 'Level AAA', rules: ['color-contrast-enhanced'] },
  { id: '2.1.1', name: 'Keyboard Navigation', level: 'Level A', rules: ['accesskeys', 'keyboard'] },
  { id: '2.1.2', name: 'No Keyboard Trap', level: 'Level A', rules: ['focus-order-semantics'] },
  { id: '2.4.1', name: 'Bypass Blocks (Skip Links)', level: 'Level A', rules: ['bypass', 'region'] },
  { id: '2.4.2', name: 'Page Titled', level: 'Level A', rules: ['document-title'] },
  { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'Level A', rules: ['link-name', 'empty-link'] },
  { id: '2.4.6', name: 'Headings and Labels', level: 'Level AA', rules: ['p-as-heading'] },
  { id: '2.4.7', name: 'Focus Visible', level: 'Level AA', rules: ['focus-visible'] },
  { id: '2.5.3', name: 'Label in Name', level: 'Level A', rules: ['label-content-name-mismatch'] },
  { id: '2.5.8', name: 'Target Size (Minimum)', level: 'Level AA', rules: ['target-size'] },
  { id: '3.1.1', name: 'Language of Page', level: 'Level A', rules: ['html-has-lang', 'html-lang-valid'] },
  { id: '4.1.1', name: 'Parsing', level: 'Level A', rules: ['duplicate-id'] },
  { id: '4.1.2', name: 'Name, Role, Value', level: 'Level A', rules: ['button-name', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value'] }
];

// Map Automated Scan to Conformance Levels
const violationRuleIds = report.remediations.map(r => r.rule);

const vpatRows = vpatCriteria.map(item => {
  const failedRules = item.rules.filter(r => violationRuleIds.includes(r));
  let status = 'Supports';
  let remarks = `Meets the automated requirements for ${item.name}.`;

  if (failedRules.length > 0) {
    status = 'Does Not Support';
    remarks = `Automated scan detected violations related to rules: ${failedRules.join(', ')}. Remediation required.`;
  }

  const badgeClass = status === 'Supports' ? 'badge-supports' : 'badge-fails';

  return `
    <tr>
      <th scope="row"><strong>${item.id}</strong> ${escapeHtml(item.name)} <span class="wcag-tag">${item.level}</span></th>
      <td><span class="vpat-status ${badgeClass}">${status}</span></td>
      <td>${escapeHtml(remarks)}</td>
    </tr>
  `;
}).join('');

// Generate Violations Detail Cards
let violationsHtml = '';
if (report.remediations.length === 0) {
  violationsHtml = `
    <div class="card success-card" role="region" aria-label="No Violations Found">
      <h3>🎉 No Automated Violations Found!</h3>
      <p>The scanned target meets all tested automated WCAG 2.2 success criteria.</p>
    </div>
  `;
} else {
  violationsHtml = report.remediations.map((item) => {
    const nodesList = item.affectedNodes.map((node, i) => `
      <div class="node-box">
        <p><strong>Affected Element #${i + 1}:</strong> <code>${escapeHtml(node.targetSelector)}</code></p>
        <div class="code-preview">
          <label>Original Code:</label>
          <pre><code>${escapeHtml(node.htmlSnippet)}</code></pre>
        </div>
        <div class="failure-desc">
          <p><strong>Remediation Guidance:</strong> ${escapeHtml(node.failureSummary)}</p>
        </div>
      </div>
    `).join('');

    return `
      <article class="issue-card impact-${item.impact}" aria-labelledby="issue-${item.id}">
        <div class="issue-header">
          <span class="badge impact-badge">${item.impact.toUpperCase()}</span>
          <h3 id="issue-${item.id}">${item.id}. ${escapeHtml(item.help)}</h3>
        </div>
        <p class="issue-desc">${escapeHtml(item.description)}</p>
        <p class="rule-ref"><strong>WCAG Rule ID:</strong> <code>${item.rule}</code> | <a href="${item.helpUrl}" target="_blank" rel="noopener">W3C Documentation</a></p>
        <div class="nodes-container">${nodesList}</div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A11yOmni Audit Dashboard & VPAT 2.5 ACR</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #151d30;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #00f2fe;
      --accent: #38bdf8;
      --success: #10b981;
      --critical: #ef4444;
      --serious: #f97316;
      --moderate: #eab308;
      --minor: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      padding: 20px;
    }
    .skip-link {
      position: absolute;
      top: -40px;
      left: 10px;
      background: var(--primary);
      color: #000;
      padding: 8px 16px;
      font-weight: 700;
      z-index: 1000;
      text-decoration: none;
      border-radius: 4px;
    }
    .skip-link:focus { top: 10px; outline: 3px solid #ffeb3b; }
    header {
      border-bottom: 2px solid #1e293b;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    h1 { color: var(--primary); font-size: 2rem; margin-bottom: 8px; }
    .meta-info { color: var(--text-muted); font-size: 0.95rem; }
    .action-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 15px;
    }
    .btn-action {
      background: #1e293b;
      color: var(--primary);
      border: 1.5px solid var(--primary);
      padding: 10px 18px;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover {
      background: var(--primary);
      color: #000;
    }
    .btn-action:focus {
      outline: 3px solid #ffeb3b;
      outline-offset: 3px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .metric-value { font-size: 2.2rem; font-weight: 800; color: var(--primary); }
    .metric-label { font-size: 0.9rem; color: var(--text-muted); }

    /* VPAT Table Styles */
    .vpat-section {
      background: var(--card-bg);
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 35px;
      overflow-x: auto;
    }
    .vpat-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      margin-top: 15px;
      font-size: 0.95rem;
    }
    .vpat-table th, .vpat-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #1e293b;
      vertical-align: top;
    }
    .vpat-table thead th {
      background: #0d1322;
      color: var(--primary);
      font-size: 0.95rem;
      border-bottom: 2px solid var(--primary);
    }
    .wcag-tag {
      font-size: 0.75rem;
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent);
      margin-left: 6px;
    }
    .vpat-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .badge-supports { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .badge-fails { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }

    /* Issue Cards */
    .issue-card {
      background: var(--card-bg);
      border: 1px solid #1e293b;
      border-left: 6px solid var(--primary);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .issue-card.impact-critical { border-left-color: var(--critical); }
    .issue-card.impact-serious { border-left-color: var(--serious); }
    .issue-card.impact-moderate { border-left-color: var(--moderate); }
    .issue-card.impact-minor { border-left-color: var(--minor); }

    .issue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      background: #1e293b;
      color: #fff;
    }
    .node-box {
      background: #0d1322;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 12px;
      margin-top: 12px;
    }
    pre {
      background: #050811;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.85rem;
      color: #38bdf8;
      margin-top: 6px;
    }
    a { color: var(--primary); text-decoration: underline; }
    a:focus { outline: 3px solid #ffeb3b; outline-offset: 2px; }

    @media print {
      body { background: #fff !important; color: #000 !important; padding: 0; }
      .action-bar, .skip-link { display: none !important; }
      .vpat-section, .metric-card, .issue-card { border: 1px solid #ccc !important; background: #fff !important; color: #000 !important; }
      h1, .metric-value, thead th { color: #000 !important; }
      pre { background: #f1f5f9 !important; color: #000 !important; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to Main Audit Content</a>
  
  <header role="banner">
    <h1>A11yOmni Autonomous Audit Dashboard</h1>
    <p class="meta-info"><strong>Target Scanned:</strong> <a href="${escapeHtml(report.url)}" target="_blank" rel="noopener">${escapeHtml(report.url)}</a></p>
    <p class="meta-info"><strong>Audit Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    
    <div class="action-bar" role="toolbar" aria-label="Export Actions">
      <button class="btn-action" onclick="window.print()" aria-label="Print or Save Official Report as PDF">🖨️ Print / Save as PDF</button>
      <button class="btn-action" onclick="downloadStandaloneReport()" aria-label="Download Standalone HTML Report File">📥 Download Standalone ACR (HTML)</button>
    </div>
  </header>

  <main id="main-content" role="main">
    <section class="dashboard-grid" aria-label="Executive Metrics">
      <div class="metric-card">
        <div class="metric-value">${score}%</div>
        <div class="metric-label">Automated Compliance Score</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: ${report.summary.violationsCount > 0 ? 'var(--critical)' : 'var(--success)'};">${report.summary.violationsCount}</div>
        <div class="metric-label">Violations Detected</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: var(--success);">${report.summary.passesCount}</div>
        <div class="metric-label">Rules Passed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: var(--text-muted);">${report.summary.incompleteCount}</div>
        <div class="metric-label">Needs Manual Verification</div>
      </div>
    </section>

    <!-- Official VPAT 2.5 Section -->
    <section class="vpat-section" aria-labelledby="vpat-heading">
      <h2 id="vpat-heading">VPAT® Version 2.5 (Revised Section 508 & WCAG 2.2 Edition)</h2>
      <p style="color: var(--text-muted); margin-top: 6px;">Accessibility Conformance Report (ACR) Table mapped from automated testing.</p>
      
      <table class="vpat-table" aria-label="VPAT 2.5 Conformance Report Table">
        <thead>
          <tr>
            <th scope="col" style="width: 38%;">Criteria</th>
            <th scope="col" style="width: 22%;">Conformance Level</th>
            <th scope="col" style="width: 40%;">Remarks and Explanations</th>
          </tr>
        </thead>
        <tbody>
          ${vpatRows}
        </tbody>
      </table>
    </section>

    <!-- Remediation Code Section -->
    <section aria-label="Remediation Details">
      <h2>Automated Remediation & Issues List</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px;">Review the affected code snippets and corresponding WCAG 2.2 criteria below.</p>
      ${violationsHtml}
    </section>
  </main>

  <script>
    function downloadStandaloneReport() {
      const htmlContent = document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VPAT_2.5_ACR_Report_' + new Date().toISOString().slice(0, 10) + '.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', fullHtml, 'utf-8');
console.log('[A11yOmni] VPAT 2.5 ACR Table and PDF/HTML Exporter successfully written to index.html');
