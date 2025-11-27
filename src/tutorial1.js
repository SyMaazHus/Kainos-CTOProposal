function revealFirstMenuIcon() {
  const firstIcon = document.querySelector(".menu-item:nth-child(1) svg");
  const tooltip = document.getElementById("tutorialTooltip");
  const overlay = document.getElementById("greyOverlay");

  if (!firstIcon) {
    console.error("找不到 menu-item 第一个图标");
    return;
  }


  const rect = firstIcon.getBoundingClientRect();

  const holeX = rect.left + rect.width / 2;
  const holeY = rect.top + rect.height / 2;


  document.documentElement.style.setProperty("--hole-x", holeX + "px");
  document.documentElement.style.setProperty("--hole-y", holeY + "px");


  overlay.style.display = "block";


  const tooltipX = rect.right + 40;
  const tooltipY = rect.top - 10;

  tooltip.style.left = tooltipX + "px";
  tooltip.style.top = tooltipY + "px";


  tooltip.style.display = "flex";
}


window.addEventListener("load", revealFirstMenuIcon);

