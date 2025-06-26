let swatches = [];
let selectedColours = {};
let currentFillTarget = null;

const layoutMap = {
  diaper: {
    Abrazo: ["AZLeftTab", "AZRightTab", "AZMiddle", "AZLeftCuff", "AZRightCuff"],
    Traditional: ["TDCWaistband", "TDCBody", "TDCLeftCuff", "TDCRightCuff"],
    Brief: ["BriefWaistband", "BriefBody", "BriefLeftCuff", "BriefRightCuff"]
  }
};

const layoutSelect = document.getElementById("layout");
const styleSelect = document.getElementById("style");

layoutSelect.addEventListener("change", () => {
  const layout = layoutSelect.value;
  populateStyleOptions(layout);
  loadLayout(layout);
});

styleSelect.addEventListener("change", () => {
  highlightParts();
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

async function loadLayout(layout) {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  try {
    const res = await fetch(`Resources/SVG/${layout}.svg`);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;
    const svg = document.querySelector("svg");
    svg.classList.add("svg-display");

    svg.querySelectorAll("*[id]").forEach(part => {
      part.style.display = "none";
      part.style.cursor = "";
      part.addEventListener("click", () => {
        if (currentFillTarget) currentFillTarget.style.stroke = "";
        currentFillTarget = part;
        part.style.stroke = "#000";
      });
    });

    highlightParts();
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${layout}</p>`;
  }
}

function highlightParts() {
  const layout = layoutSelect.value;
  const style = styleSelect.value;
  const parts = layoutMap[layout]?.[style];
  if (!parts) return;

  const svg = document.querySelector("svg");
  parts.forEach(id => {
    const part = svg.getElementById(id);
    if (part) {
      part.style.display = "";
      part.style.cursor = "pointer";
    }
  });
}

fetch("swatches.json")
  .then(res => res.json())
  .then(data => {
    swatches = data.filter(s => s.type === "pattern");

    const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    document.querySelector("svg")?.appendChild(svgDefs);

    const swatchList = document.getElementById("swatchList");
    swatchList.innerHTML = "";

    swatches.forEach(swatch => {
      const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
      pattern.setAttribute("id", swatch.svgPatternId);
      pattern.setAttribute("patternUnits", "objectBoundingBox");
      pattern.setAttribute("width", "1");
      pattern.setAttribute("height", "1");

      const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
      image.setAttribute("href", swatch.imageUrl);
      image.setAttribute("width", "100");
      image.setAttribute("height", "100");
      pattern.appendChild(image);
      svgDefs.appendChild(pattern);

      const el = document.createElement("div");
      el.className = "swatch";
      el.style.backgroundImage = `url(${swatch.imageUrl})`;
      el.title = swatch.name;
      el.addEventListener("click", () => {
        if (currentFillTarget) {
          currentFillTarget.setAttribute("fill", `url(#${swatch.svgPatternId})`);
        }
      });
      swatchList.appendChild(el);
    });
  });
