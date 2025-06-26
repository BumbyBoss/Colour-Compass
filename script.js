// === SCRIPT.JS ===
let swatches = [];
let selectedColours = {};
let currentFillTarget = null;

const layoutMap = {
  diaper: {
    Abrazo: ["AZLeftTab", "AZRightTab", "AZMiddle", "AZLeftCuff", "AZRightCuff"],
    Traditional: ["TDCBody", "TDCWaistband", "TDCLeftCuff", "TDCRightCuff"],
    Brief: ["BriefBody", "BriefWaistband", "BriefLeftCuff", "BriefRightCuff"]
  },
  grid: {
    Grid: [
      "Zone 1", "Zone 2", "Zone 3",
      "Zone 4", "Zone 5", "Zone 6",
      "Zone 7", "Zone 8", "Zone 9"
    ]
  }
};

const layoutSelect = document.getElementById("layout");
const styleSelect = document.getElementById("style");

layoutSelect.addEventListener("change", () => {
  const layout = layoutSelect.value;
  populateStyleOptions(layout);
  if (styleSelect.value) {
    loadLayout(layout, styleSelect.value);
  }
});

styleSelect.addEventListener("change", () => {
  const layout = layoutSelect.value;
  const style = styleSelect.value;
  loadLayout(layout, style);
});

function populateStyleOptions(layout) {
  styleSelect.innerHTML = `<option value="">-- Select Style --</option>`;
  const styles = layoutMap[layout];
  if (!styles) return;

  Object.keys(styles).forEach(style => {
    const option = document.createElement("option");
    option.value = style;
    option.textContent = style;
    styleSelect.appendChild(option);
  });
}

async function loadLayout(layout, style) {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  const svgFile = `Resources/SVG/${style}.svg`;

  try {
    const res = await fetch(svgFile);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;
    const svg = document.querySelector("svg");
    svg.classList.add("svg-display");

    // Hide all parts
    svg.querySelectorAll("*[id]").forEach(part => {
      part.style.display = "none";
      part.style.cursor = "";
    });

    // Enable correct parts
    const parts = layoutMap[layout]?.[style];
    if (!parts) return;
    parts.forEach(id => {
      const part = svg.getElementById(id);
      if (part) {
        part.style.display = "";
        part.style.cursor = "pointer";
        part.addEventListener("click", () => {
          if (currentFillTarget) currentFillTarget.style.stroke = "";
          currentFillTarget = part;
          part.style.stroke = "#000";
        });
      }
    });
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${layout}</p>`;
  }
}

// === SWATCHES ===
fetch("swatches.json")
  .then(res => res.json())
  .then(data => {
    swatches = data.filter(s => s.imageUrl);
    const swatchList = document.getElementById("swatchList");
    swatches.forEach(swatch => {
      const el = document.createElement("div");
      el.className = "swatch";
      el.style.backgroundImage = `url(${swatch.imageUrl})`;
      el.title = swatch.name;
      el.addEventListener("click", () => {
        if (currentFillTarget) {
          currentFillTarget.style.fill = `url(#${swatch.svgPatternId})`;
        }
      });
      swatchList.appendChild(el);
    });
  })
  .catch(error => {
    console.error("Error loading swatches:", error);
  });
