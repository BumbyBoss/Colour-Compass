// FILE: script.js
// LOCATION: Colour-Compass/script.js

document.addEventListener("DOMContentLoaded", () => {
  const layoutSelect = document.getElementById("layout-select");
  const displayArea = document.getElementById("display-area");

  function loadSVG(layout) {
    const path = `svg/${layout}.svg`;
    fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`SVG not found: ${path}`);
        }
        return response.text();
      })
      .then(svg => {
        displayArea.innerHTML = svg;
        displayArea.querySelector("svg").classList.add("svg-display");
      })
      .catch(error => {
        console.error("Error loading SVG:", error);
        displayArea.innerHTML = `<p>Could not load design preview.</p>`;
      });
  }

  layoutSelect.addEventListener("change", (e) => {
    const selected = e.target.value;
    loadSVG(selected);
  });

  // Load default on page load
  loadSVG(layoutSelect.value);
});
