/**
 * A11yOmni - Option 2: Source Code Archive (.ZIP) Static AST & DOM Engine
 * Recursively inspects HTML/JS markup inside archives without requiring a running web server.
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { chromium } = require('playwright');
const axeSource = require('axe-core').source;

async function runZipScan(zipFilePath) {
  if (!fs.existsSync(zipFilePath)) {
    console.error(`[A11yOmni ZipEngine] File not found: ${zipFilePath}`);
    process.exit(1);
  }

  console.log(`\n==================================================`);
  console.log(`[A11yOmni] Unpacking & Scanning Source Archive: ${zipFilePath}`);
  console.log(`==================================================\n`);

  const tempExtractDir = path.join(__dirname, '.temp_extracted_code');
  if (fs.existsSync(tempExtractDir)) {
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempExtractDir, { recursive: true });

  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(tempExtractDir, true);

  // Recursively find all HTML files
  function findHtmlFiles(dir, list = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findHtmlFiles(fullPath, list);
      } else if (file.endsWith('.html') || file.endsWith('.htm')) {
        list.push(fullPath);
      }
    }
    return list;
  }

  const htmlFiles = findHtmlFiles(tempExtractDir);
  console.log(`[A11yOmni] Located ${htmlFiles.length} HTML files for structural audit.`);

  if (htmlFiles.length === 0) {
    console.warn(`[A11yOmni] Warning: No HTML markup found inside the uploaded ZIP.`);
    process.exit(0);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let combinedViolations = [];
  let combinedPasses = [];
  let combinedIncomplete = [];

  for (const filePath of htmlFiles) {
    const relativePath = path.relative(tempExtractDir, filePath);
    console.log(`- Auditing: ${relativePath}`);
    
    const fileUrl = 'file://' + path.resolve(filePath);
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.evaluate(axeSource);

    const results = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
      });
    });

    results.violations.forEach(v => {
      v.nodes.forEach(n => {
        n.targetSelector = `[${relativePath}] > ` + n.target.join(' > ');
      });
      combinedViolations.push(v);
    });

    combinedPasses.push(...results.passes);
    combinedIncomplete.push(...results.incomplete);
  }

  await browser.close();
  fs.rmSync(tempExtractDir, { recursive: true, force: true });

  const processedReport = {
    timestamp: new Date().toISOString(),
    url: `Source Code Archive: ${path.basename(zipFilePath)} (${htmlFiles.length} files scanned)`,
    summary: {
      violationsCount: combinedViolations.length,
      passesCount: combinedPasses.length,
      incompleteCount: combinedIncomplete.length
    },
    remediations: combinedViolations.map((v, index) => ({
      id: index + 1,
      rule: v.id,
      impact: v.impact || 'serious',
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      affectedNodes: v.nodes.map(node => ({
        htmlSnippet: node.html,
        targetSelector: node.targetSelector,
        failureSummary: node.failureSummary
      }))
    }))
  };

  fs.writeFileSync('audit-report.json', JSON.stringify(processedReport, null, 2), 'utf-8');
  console.log(`\n[A11yOmni] Zip Scan complete! Output stored in audit-report.json\n`);
}

const inputZip = process.argv[2] || 'source.zip';
runZipScan(inputZip);
