// Auto-inject Accessible Enterprise Footer for A11yOmni
document.addEventListener("DOMContentLoaded", function () {
  const footer = document.createElement("footer");
  footer.setAttribute("role", "contentinfo");
  footer.style.marginTop = "3rem";
  footer.style.padding = "1.5rem";
  footer.style.textAlign = "center";
  footer.style.borderTop = "1px solid #dee2e6";
  footer.style.backgroundColor = "#ffffff";
  footer.style.fontSize = "0.95rem";
  footer.style.color = "#495057";

  footer.innerHTML = `
    <p style="margin: 0.25rem 0;">© 2026 <strong>Resilience Industries</strong>. All rights reserved.</p>
    <p style="margin: 0.5rem 0;">
      <a href="legal.html" style="color: #0d6efd; font-weight: bold; text-decoration: underline;">
        Privacy Policy, Terms of Service & Compliance
      </a>
    </p>
  `;

  document.body.appendChild(footer);
});
