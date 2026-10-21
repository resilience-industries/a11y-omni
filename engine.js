/**
 * A11yOmni - Universal Autonomous Accessibility Engine (Core Scanner)
 * Compliant with WCAG 2.1, WCAG 2.2 (Level A, AA, AAA) and WAI-ARIA 1.2
 */

const { chromium } = require('playwright');
const axeSource = require('axe-core').source;

async function runOmniScan(targetUrl) {
  console.log(`\n==================================================`);
  console.log(`[A11yOmni] Launching Autonomous Scan on: ${targetUrl}`);
  console.log(`==================================================\n`);

  // Launch headless browser in background
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) A11yOmni Autonomous Engine/1.0'
  });
  const page = await context.newPage();

  try {
    // Navigate to URL and wait for DOM and network idle
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });

    // Inject axe-core into the live rendered DOM
    await page.evaluate(axeSource);

    // Run WCAG 2.2 AAA Deep Scan
    const results = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
        }
      });
    });

    console.log(`[A11yOmni] Scan Completed Successfully!`);
    console.log(`- Violations (Errors Found): ${results.violations.length}`);
    console.log(`- Passes (Rules Followed): ${results.passes.length}`);
    console.log(`- Incomplete (Needs Manual Verify): ${results.incomplete.length}`);

    // Parse and generate remediation output
    const processedReport = {
      timestamp: new Date().toISOString(),
      url: targetUrl,
      summary: {
        violationsCount: results.violations.length,
        passesCount: results.passes.length,
        incompleteCount: results.incomplete.length
      },
      remediations: results.violations.map((v, index) => {
        return {
          id: index + 1,
          rule: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          tags: v.tags,
          affectedNodes: v.nodes.map(node => ({
            htmlSnippet: node.html,
            targetSelector: node.target.join(' > '),
            failureSummary: node.failureSummary
          }))
        };
      })
    };

    // Save report to disk as JSON
    const fs = require('fs');
    fs.writeFileSync('audit-report.json', JSON.stringify(processedReport, null, 2), 'utf-8');
    console.log(`\n[A11yOmni] Structured report generated at: audit-report.json\n`);

    return processedReport;

  } catch (error) {
    console.error(`[A11yOmni] Engine Error: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Read target URL from terminal input or fallback to resilience site
const inputUrl = process.argv[2] || 'https://resilience-industries.github.io';
runOmniScan(inputUrl);
