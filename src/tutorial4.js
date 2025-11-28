function revealFirstMenuIcon() {
  const pills = document.querySelector(".three-pills");
  const tooltip = document.getElementById("tutorialTooltip1");
  const overlay = document.getElementById("greyOverlay1");

  if (!pills) {
    console.error("找不到 three-pills");
    return;
  }

  const rect = pills.getBoundingClientRect();


  const holeX = rect.left + rect.width / 2;
  const holeY = rect.top + rect.height / 2;


  document.documentElement.style.setProperty("--hole-x", holeX + "px");
  document.documentElement.style.setProperty("--hole-y", holeY + "px");

 
  overlay.style.display = "block";


  const tooltipWidth = tooltip.offsetWidth;
  const tooltipX = holeX - tooltipWidth / 2;
  const tooltipY = rect.bottom + 20;

  tooltip.style.left = tooltipX + "px";
  tooltip.style.top = tooltipY + "px";


  tooltip.style.display = "flex";
}

window.addEventListener("load", revealFirstMenuIcon);
