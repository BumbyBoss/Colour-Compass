let swatches = [];
let selectedColours = {};
let currentFillTarget = null;

const layoutMap = {
  diaper: {
    Abrazo: ["AZLeftTab", "AZRightTab", "AZMiddle", "AZLeftCuff", "AZRightCuff"],
    Brief: ["BriefWaistband", "BriefBody", "BriefLeftCuff", "BriefRightCuff"],
    Traditional: ["TDCWaistband", "TDCBody", "TDCLeftCuff", "TDCRightCuff"]
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
  document.getElementById("display-area").innerHTML = "";
});

styleSelect.addEventListener("change", () => {
  const style = styleSelect.value;
  if (style) {
    loadSVG(style);
  }
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

async function loadSVG(style) {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  try {
    const res = await fetch(`Resources/SVG/${style}.svg`);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;

    const svg = document.querySelector("svg");
    svg.classList.add("svg-display");

    svg.querySelectorAll("*[id]").forEach(part => {
      part.style.display = "none";
      part.style.cursor = "";
    });

    svg.querySelectorAll("*[id]").forEach(part => {
      part.addEventListener("click", () => {
        if (currentFillTarget) currentFillTarget.style.stroke = "";
        currentFillTarget = part;
        part.style.stroke = "#000";
      });
    });

    highlightParts();
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${style}</p>`;
  }
}

function highlightParts() {
  const layout = layoutSelect.value;
  const style = styleSelect.value;
  const parts = layoutMap[layout]?.[style];
  if (!parts) return;

  const svg = document.querySelector("svg");

  parts.forEach(id => {
    const part = svg?.getElementById(id);
    if (part) {
      part.style.display = "";
      part.style.cursor = "pointer";
    }
  });
}

fetch("swatches.json")
  .then(res => res.json())
  .then(data => {
    swatches = data;
    const swatchList = document.getElementById("swatchList");
    swatchList.innerHTML = "";
    swatches.forEach(swatch => {
      if (!swatch.imageUrl) return;
      const el = document.createElement("div");
      el.className = "swatch";
      el.style.backgroundImage = `url('${swatch.imageUrl}')`;
      el.title = swatch.name;
      el.addEventListener("click", () => {
        if (currentFillTarget) {
          currentFillTarget.style.fill = `url(#${swatch.svgPatternId})`;
        }
      });
      swatchList.appendChild(el);
    });
  });
