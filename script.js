let swatches = [];
let selectedColours = {};

const layoutMap = {
  // ... already present structure from canvas ...
};

const layoutSelect = document.getElementById("layout");
const styleSelect = document.getElementById("style");
let currentFillTarget = null;

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
    document.querySelector("svg").classList.add("svg-display");

    document.querySelectorAll("#display-area svg *").forEach(part => {
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

  parts.forEach(id => {
    const part = document.getElementById(id);
    if (part) {
      part.style.cursor = "pointer";
    }
  });
}

fetch("swatches.json")
  .then(res => res.json())
  .then(data => {
    swatches = data;
    const swatchList = document.getElementById("swatchList");
    swatches.forEach(swatch => {
      const el = document.createElement("div");
      el.className = "swatch";
      el.style.backgroundColor = swatch.hex || swatch.color;
      el.title = swatch.name;
      el.addEventListener("click", () => {
        if (currentFillTarget) {
          currentFillTarget.style.fill = swatch.hex || swatch.color;
        }
      });
      swatchList.appendChild(el);
    });
  });
