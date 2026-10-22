// A11yOmni Enterprise Credit Top-Up & Request System
document.addEventListener("DOMContentLoaded", function () {
  const checkBalanceInterval = setInterval(() => {
    const balanceElem = document.getElementById("credit-balance") || document.querySelector("[data-credits]");
    if (balanceElem) {
      clearInterval(checkBalanceInterval);
      
      const topupBtn = document.createElement("button");
      topupBtn.innerText = "+ Get More Credits";
      topupBtn.setAttribute("aria-label", "Request more audit credits or Enterprise plan");
      topupBtn.style.marginLeft = "10px";
      topupBtn.style.padding = "4px 10px";
      topupBtn.style.backgroundColor = "#28a745";
      topupBtn.style.color = "#ffffff";
      topupBtn.style.border = "none";
      topupBtn.style.borderRadius = "4px";
      topupBtn.style.fontWeight = "bold";
      topupBtn.style.cursor = "pointer";

      topupBtn.onclick = function () {
        alert("A11yOmni Enterprise Support:\nTo recharge your credits or request an enterprise plan, email resilienceindustries.contact@gmail.com with your registered Google Account ID.");
      };

      balanceElem.parentNode.appendChild(topupBtn);
    }
  }, 1000);
});
