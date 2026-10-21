/**
 * A11yOmni - Universal Report & VPAT 2.5 ACR Generator
 * Converts audit-report.json into an Accessible Dashboard and Conformance Table
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

let violationsHtml = '';
if (report.remediations.length === 0) {
  violationsHtml = `
    <div class="card success-card" role="region" aria-label="No Violations Found">
      <h3>🎉 No Automated Violations Found!</h3>
      <p>The scanned target meets all tested WCAG 2.2 automated success criteria.</p>
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
          <p><strong>Why it failed:</strong> ${escapeHtml(node.failureSummary)}</p>
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
        <p class="rule-ref"><strong>WCAG Rule:</strong> <code>${item.rule}</code> | <a href="${item.helpUrl}" target="_blank" rel="noopener">Learn more about this rule</a></p>
        
        <div class="nodes-container">
          ${nodesList}
        </div>
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
  <title>A11yOmni Audit Dashboard & VPAT 2.5 Report</title>
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
      margin-bottom: 30px;
    }
    h1 { color: var(--primary); font-size: 2rem; margin-bottom: 8px; }
    .meta-info { color: var(--text-muted); font-size: 0.95rem; }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
    button:focus { outline: 3px solid #ffeb3b; }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to Main Audit Content</a>
  
  <header role="banner">
    <h1>A11yOmni Autonomous Audit Dashboard</h1>
    <p class="meta-info"><strong>Target Scanned:</strong> <a href="${escapeHtml(report.url)}" target="_blank" rel="noopener">${escapeHtml(report.url)}</a></p>
    <p class="meta-info"><strong>Audit Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
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

    <section aria-label="Remediation Details">
      <h2>Automated Remediation & Issues List</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px;">Review the affected code snippets and corresponding WCAG 2.2 criteria below.</p>
      ${violationsHtml}
    </section>
  </main>
</body>
</html>
`;

fs.writeFileSync('index.html', fullHtml, 'utf-8');
console.log('[A11yOmni] Fully Accessible Dashboard successfully written to index.html');
