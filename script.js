// FILE: script.js
// LOCATION: Colour-Compass/script.js

let swatches = [];
let selectedColours = {};

const layoutMap = {
  grid: [
    "zone-1", "zone-2", "zone-3",
    "zone-4", "zone-5", "zone-6",
    "zone-7", "zone-8", "zone-9"
  ],
  diaper: ["AZBody", "AZLeftTab", "AZRightTab"],
  kidpants: ["AZBody", "AZWaistband", "AZCuffs"],
  kidcrops: ["AZBody", "AZWaistband", "AZCuffs"],
  kidshorts: ["AZBody", "AZWaistband"],
  sweater: ["AZBody", "AZLeftSleeve", "AZRightSleeve", "AZCuffs", "AZBottomBand", "AZNeckband", "AZPatch"]
};

const loadLayout = async (layout) => {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  try {
    const res = await fetch(`svg/${layout}.svg`);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;
    document.querySelector("svg").classList.add("svg-display");
    applyColours(layout);
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${layout}</p>`;
  }
};

const loadSwatches = async () => {
  try {
    const res = await fetch("swatches.json");
    swatches = await res.json();
  } catch (err) {
    console.error("Failed to load swatches:", err);
  }
};

const createSelectors = (layout) => {
  const selectorSection = document.querySelector(".selector");
  document.querySelectorAll(".swatch-row").forEach(row => row.remove());

  const zones = layoutMap[layout] || [];
  selectedColours = {};

  zones.forEach((zoneId, index) => {
    const row = document.createElement("div");
    row.className = "swatch-row";

    const label = document.createElement("label");
    label.textContent = `Swatch ${index + 1} – ${zoneId}`;
    row.appendChild(label);

    const select = document.createElement("select");
    select.dataset.zone = zoneId;

    swatches.forEach(swatch => {
      const option = document.createElement("option");
      option.value = swatch.svgPatternId || "";
      option.textContent = swatch.name || "Choose a colour";
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      selectedColours[zoneId] = e.target.value;
      applyColours(layout);
    });

    row.appendChild(select);
    selectorSection.appendChild(row);
  });
};

const applyColours = (layout) => {
  const svg = document.querySelector("svg");
  if (!svg) return;

  const zones = layoutMap[layout] || [];

  zones.forEach(zoneId => {
    const part = svg.getElementById(zoneId);
    const patternId = selectedColours[zoneId];
    if (part && patternId) {
      part.setAttribute("fill", `url(#${patternId})`);
    }
  });
};

const layoutSelect = document.getElementById("layout-select");
layoutSelect.addEventListener("change", async (e) => {
  const layout = e.target.value;
  await loadLayout(layout);
  createSelectors(layout);
});

// Download button logic (as PNG)
const downloadButton = document.getElementById("download-button");
downloadButton.addEventListener("click", () => {
  const svgEl = document.querySelector("svg");
  if (!svgEl) return;

  const nameInput = document.getElementById("filename-input");
  const notesInput = document.getElementById("notes-input");

  const name = nameInput?.value.trim() || "bumby-colour-compass";
  const notes = notesInput?.value.trim() || "";
  const filename = notes ? `${name} - ${notes}` : name;

  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const svgData = new XMLSerializer().serializeToString(clone);
  const canvas = document.createElement("canvas");
  const bbox = svgEl.getBBox();
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = pngUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.src = url;
});

(async () => {
  await loadSwatches();
  const defaultLayout = layoutSelect.value;
  await loadLayout(defaultLayout);
  createSelectors(defaultLayout);
})();
