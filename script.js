let swatches = [];
let selectedColours = {};
let currentFillTarget = null;

const layoutMap = {
  "diaper": {
    "Abrazo": ["AZLeftTab", "AZRightTab", "AZMiddle", "AZLeftCuff", "AZRightCuff"],
    "Traditional": ["TDCBody", "TDCWaistband", "TDCLeftCuff", "TDCRightCuff"],
    "Brief": ["BriefBody", "BriefWaistband", "BriefLeftCuff", "BriefRightCuff"]
  },
  "grid": {
    "Grid": [
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
  clearSVG();
});

styleSelect.addEventListener("change", () => {
  const layout = layoutSelect.value;
  const style = styleSelect.value;
  if (layout && style) {
    loadLayout(style, layout);
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

function clearSVG() {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  currentFillTarget = null;
}

async function loadLayout(style, layout) {
  clearSVG();
  const displayArea = document.getElementById("display-area");
  const svgFile = `Resources/SVG/${style}.svg`;

  try {
    const res = await fetch(svgFile);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;

    const svg = document.querySelector("svg");
    svg.classList.add("svg-display");

    const validParts = layoutMap[layout]?.[style];
    svg.querySelectorAll("*[id]").forEach(part => {
      const partId = part.getAttribute("id");
      if (validParts.includes(partId)) {
        part.style.display = "";
        part.style.cursor = "pointer";
        part.addEventListener("click", () => {
          if (currentFillTarget) currentFillTarget.style.stroke = "";
          currentFillTarget = part;
          part.style.stroke = "#000";
        });
      } else {
        part.style.display = "none";
      }
    });

    injectSwatchPatterns(svg); // ← required to show pattern fills
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${style}</p>`;
    console.error("SVG load error:", err);
  }
}

function injectSwatchPatterns(svg) {
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  swatches.forEach(swatch => {
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", swatch.svgPatternId);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "100");
    pattern.setAttribute("height", "100");

    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("href", swatch.imageUrl);
    image.setAttribute("width", "100");
    image.setAttribute("height", "100");

    pattern.appendChild(image);
    defs.appendChild(pattern);
  });
  svg.insertBefore(defs, svg.firstChild);
}

// === SWATCHES ===
fetch("swatches.json")
  .then(res => res.json())
  .then(data => {
    swatches = data.filter(s => s.imageUrl);
    const swatchList = document.getElementById("swatchList");
    swatchList.innerHTML = "";

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
