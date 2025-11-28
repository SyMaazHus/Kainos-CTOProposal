function revealFirstMenuIcon() {
  const pills = document.querySelector(".three-pills");
  const tooltip = document.getElementById("tutorialTooltip1");
  const overlay = document.getElementById("greyOverlay1");

  if (!pills) {
    console.error("找不到 three-pills");
    return;
  }

  // 取得 pills 区域的位置
  const rect = pills.getBoundingClientRect();

  // 计算洞的中心（pills 的正中间）
  const holeX = rect.left + rect.width / 2;
  const holeY = rect.top + rect.height / 2;

  // 设置 CSS 变量（让洞显示）
  document.documentElement.style.setProperty("--hole-x", holeX + "px");
  document.documentElement.style.setProperty("--hole-y", holeY + "px");

  // 显示蒙版
  overlay.style.display = "block";

  // ⭐ 计算 tooltip 位置（在洞下面居中）
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipX = holeX - tooltipWidth / 2;
  const tooltipY = rect.bottom + 20;

  tooltip.style.left = tooltipX + "px";
  tooltip.style.top = tooltipY + "px";

  // 显示 tooltip
  tooltip.style.display = "flex";
}

window.addEventListener("load", revealFirstMenuIcon);
