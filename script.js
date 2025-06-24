// FILE: script.js
// LOCATION: Colour-Compass/script.js

document.addEventListener("DOMContentLoaded", function () {
  const layoutSelect = document.getElementById("layout-select");
  const displayArea = document.getElementById("display-area");

  layoutSelect.addEventListener("change", function () {
    const layout = layoutSelect.value;
    renderLayout(layout);
  });

  function renderLayout(layout) {
    displayArea.innerHTML = "";

    if (layout === "grid") {
      for (let i = 0; i < 9; i++) {
        const box = document.createElement("div");
        box.classList.add("color-box");
        displayArea.appendChild(box);
      }
    } else {
      const svgPath = `svgs/${layout}.svg`; // e.g., svgs/diaper.svg
      const embed = document.createElement("object");
      embed.data = svgPath;
      embed.type = "image/svg+xml";
      embed.width = "300";
      embed.height = "300";
      displayArea.appendChild(embed);
    }
  }

  // Load default view
  renderLayout(layoutSelect.value);
});
