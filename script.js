// FILE: script.js
// LOCATION: Colour-Compass/script.js

let swatches = [];
let selectedColours = {};
let currentZones = [];

const layoutGroups = {
  diaper: ["Abrazo", "TraditionalDC", "Brief"],
  kidcrops: ["HemmedCrop", "HemmedEuroCrop", "DigsCrop", "CuffedCrop", "CuffedEuroCrop", "RuffleCrop"],
  kidshorts: ["HemmedShorts", "CuffedShorts", "RuffledShorts", "BloomerShorts", "Skirtie"],
  kidpants: [
    "HaremPants", "LeggingPants", "JoggersPants", "RufflePants",
    "HemmedPants", "CuffedPants", "EuroHemmedPants", "EuroCuffedPants",
    "EuroSweatPants", "BritchesPants", "FootiesPants", "BootcutPants"
  ],
  sweater: [
    "CampfireSweater", "CardiganSweater", "CocoonSweater", "CrewNeckSweater",
    "HalfZipSweater", "HenleySweater", "ShawlNeckSweater", "SheepyHugSweater",
    "QuarterSweater", "Vest"
  ],
  grid: ["BasicGrid"]
};

const layoutToZones = {
  // This will be dynamically updated based on SVG structure.
};

const layoutSelect = document.getElementById("layout-select");
const groupSelect = document.getElementById("group-select");
const zonesContainer = document.getElementById("zones-container");
const displayArea = document.getElementById("display-area");

layoutSelect.addEventListener("change", () => {
  const layout = layoutSelect.value;
  if (!layout || !layoutGroups[layout]) {
    groupSelect.style.display = "none";
    groupSelect.previousElementSibling.style.display = "none";
    zonesContainer.innerHTML = "";
    displayArea.innerHTML = "";
    return;
  }

  populateGroups(layout);
  groupSelect.style.display = "block";
  groupSelect.previousElementSibling.style.display = "block";
});

groupSelect.addEventListener("change", async () => {
  const layout = layoutSelect.value;
  const group = groupSelect.value;
  if (!layout || !group) return;

  await loadLayout(layout);
  currentZones = getZoneIds(group);
  createSwatchSelectors(currentZones);
});

const populateGroups = (layout) => {
  groupSelect.innerHTML = '<option value="">-- Select Style --</option>';
  layoutGroups[layout].forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    groupSelect.appendChild(opt);
  });
};

const getZoneIds = (group) => {
  // Use consistent naming convention from SVG
  return [...document.querySelectorAll(`#${group} > *`)].map(el => el.id);
};

const createSwatchSelectors = (zones) => {
  zonesContainer.innerHTML = "";
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
      applyColours();
    });

    row.appendChild(select);
    zonesContainer.appendChild(row);
  });
};

const applyColours = () => {
  const svg = document.querySelector("svg");
  if (!svg) return;

  currentZones.forEach(zoneId => {
    const part = svg.getElementById(zoneId);
    const patternId = selectedColours[zoneId];
    if (part && patternId) {
      part.setAttribute("fill", `url(#${patternId})`);
    }
  });
};

const loadLayout = async (layout) => {
  displayArea.innerHTML = "";
  try {
    const res = await fetch(`svg/${layout}.svg`);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;
    document.querySelector("svg").classList.add("svg-display");
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

// PNG export
const downloadButton = document.getElementById("download-button");
downloadButton.addEventListener("click", () => {
  const svgEl = document.querySelector("svg");
  if (!svgEl) return;

  const nameInput = document.getElementById("filename-input");
  const notesInput = document.getElementById("notes-input");
  const customName = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "bumby-colour-compass";

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
    link.download = `${customName}.png`;
    link.href = pngUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.src = url;
});

// Init
(async () => {
  await loadSwatches();
})();
