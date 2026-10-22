/**
 * A11yOmni Unified UI Bridge & Action Hub
 * Founder & Architect: Nitesh Kumar
 * Organization: Resilience Industries
 * Official Contact: niteshkumar91845@gmail.com | +91 8434721287
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check periodically for audit result container
  const checkAuditContainer = setInterval(() => {
    const mainContent = document.querySelector("main") || document.body;
    const existingExportHub = document.getElementById("a11yomni-export-hub");

    if (mainContent && !existingExportHub) {
      clearInterval(checkAuditContainer);

      const hubCard = document.createElement("section");
      hubCard.id = "a11yomni-export-hub";
      hubCard.setAttribute("aria-labelledby", "export-hub-heading");
      hubCard.style.margin = "2rem auto";
      hubCard.style.padding = "1.5rem";
      hubCard.style.maxWidth = "900px";
      hubCard.style.backgroundColor = "#ffffff";
      hubCard.style.border = "2px solid #0056b3";
      hubCard.style.borderRadius = "8px";
      hubCard.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";

      hubCard.innerHTML = `
        <div style="border-bottom: 2px solid #e9ecef; padding-bottom: 0.8rem; margin-bottom: 1rem;">
          <h2 id="export-hub-heading" style="color: #003366; margin: 0; font-size: 1.4rem;">
            Enterprise Multi-Format Exporter & Self-Healing Engine
          </h2>
          <p style="margin: 0.3rem 0; font-size: 0.9rem; color: #495057;">
            Official Certification by <strong>Resilience Industries</strong> | Lead Auditor: <strong>Nitesh Kumar</strong>
          </p>
          <p style="margin: 0.2rem 0; font-size: 0.85rem; color: #6c757d;">
            Official Support: niteshkumar91845@gmail.com | +91 8434721287
          </p>
        </div>

        <div style="margin-bottom: 1.2rem;">
          <p style="font-weight: bold; margin-bottom: 0.5rem; color: #212529;">
            Available One-Click Downloads & Remediation (Pay-Per-Output / Included with Active Credits):
          </p>
          <div role="group" aria-label="Export and Auto-Fix actions" style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
            <button id="btn-export-excel" style="background-color: #198754; color: white; border: none; padding: 0.6rem 1rem; border-radius: 4px; font-weight: bold; cursor: pointer;">
              Download Excel Report (.CSV/.XLSX)
            </button>
            <button id="btn-export-word" style="background-color: #0d6efd; color: white; border: none; padding: 0.6rem 1rem; border-radius: 4px; font-weight: bold; cursor: pointer;">
              Download Word VPAT (.DOCX)
            </button>
            <button id="btn-export-code" style="background-color: #6f42c1; color: white; border: none; padding: 0.6rem 1rem; border-radius: 4px; font-weight: bold; cursor: pointer;">
              Download Auto-Fixed Code (.HTML)
            </button>
            <button id="btn-export-pdf" style="background-color: #dc3545; color: white; border: none; padding: 0.6rem 1rem; border-radius: 4px; font-weight: bold; cursor: pointer;">
              Print / Save Verified PDF
            </button>
          </div>
        </div>

        <div id="export-status-message" aria-live="polite" style="margin-top: 0.5rem; font-weight: bold; font-size: 0.95rem; color: #0d6efd;"></div>
      `;

      mainContent.appendChild(hubCard);

      // Event Listeners for Export Action Buttons
      function handleExport(formatType) {
        const statusElem = document.getElementById("export-status-message");
        statusElem.innerText = `Preparing official ${formatType} deliverable with Resilience Industries signature...`;

        // Run Fix Engine on Active Document Markup
        if (window.A11yOmniFixEngine && window.A11yOmniExporter) {
          const rawMarkup = document.documentElement.outerHTML;
          const auditResult = window.A11yOmniFixEngine.auditAndRemediate(rawMarkup);
          window.A11yOmniExporter.exportAuditReport(auditResult, formatType);
          statusElem.innerText = `Success: Official ${formatType} report generated.`;
        } else {
          statusElem.innerText = `Error: Core Engine modules synchronizing. Please retry in 5 seconds.`;
        }
      }

      document.getElementById("btn-export-excel").addEventListener("click", () => handleExport("EXCEL"));
      document.getElementById("btn-export-word").addEventListener("click", () => handleExport("WORD"));
      document.getElementById("btn-export-code").addEventListener("click", () => handleExport("CLEAN_CODE"));
      document.getElementById("btn-export-pdf").addEventListener("click", () => handleExport("PDF"));
    }
  }, 1000);
});
