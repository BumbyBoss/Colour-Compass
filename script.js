document.addEventListener("DOMContentLoaded", () => {
  const layoutSelect = document.getElementById("layout-select");
  const displayArea = document.getElementById("display-area");

  layoutSelect.addEventListener("change", () => {
    const layout = layoutSelect.value;
    displayArea.innerHTML = ""; // Clear previous SVG

    if (!layout) return;

    const svgPath = `svgs/${layout}.svg`;
    const objectElement = document.createElement("object");
    objectElement.setAttribute("type", "image/svg+xml");
    objectElement.setAttribute("data", svgPath);
    objectElement.setAttribute("class", "svg-display");

    displayArea.appendChild(objectElement);
  });

  // Optional: trigger default load on page init
  layoutSelect.dispatchEvent(new Event("change"));
});
