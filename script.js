// FILE: script.js
// LOCATION: Colour-Compass/script.js

let swatches = [];
let selectedColours = {};
let currentLayout = "";
let currentStyle = "";

const layoutMap = {
  grid: ["zone-1", "zone-2", "zone-3", "zone-4", "zone-5", "zone-6", "zone-7", "zone-8", "zone-9"]
};

const groupMap = {
  kidpants: [
    "HaremPants", "LeggingPants", "JoggersPants", "RufflePants",
    "HemmedPants", "CuffedPants", "EuroHemmedPants", "EuroCuffedPants",
    "EuroSweatPants", "BritchesPants", "FootiesPants", "BootcutPants"
  ],
  kidcrops: ["HemmedCrop", "CuffedCrop", "DigsCrop", "HemmedEuroCrop", "RuffleCrop"],
  kidshorts: ["HemmedShorts", "CuffedShorts", "RuffledShorts", "BloomerShorts", "Skirtie"],
  diaper: ["Abrazo", "TraditionalDC", "Brief"],
  sweater: [
    "CampfireSweater", "CardiganSweater", "CocoonSweater", "CrewNeckSweater",
    "HalfZipSweater", "HenleySweater", "ShawlNeckSweater", "SheepyHugSweater",
    "QuarterSweater", "Vest"
  ]
};

const zoneAliasMap = {
  "LeftCuff": "Cuffs",
  "RightCuff": "Cuffs",
  "LeftLeg": "Legs",
  "RightLeg": "Legs",
  "LeftSleeve": "Sleeves",
  "RightSleeve": "Sleeves"
};

const loadSwatches = async () => {
  try {
    const res = await fetch("swatches.json");
    swatches = await res.json();
  } catch (err) {
    console.error("Failed to load swatches:", err);
  }
};

const loadLayout = async (layout) => {
  const displayArea = document.getElementById("display-area");
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

const updateStyleOptions = (layout) => {
  const groupSelect = document.getElementById("group-select");
  const label = document.querySelector("label[for='group-select']");
  groupSelect.innerHTML = "<option value=''>-- Select Style --</option>";
  label.style.display = "inline-block";
  groupSelect.style.display = "inline-block";

  const groups = groupMap[layout] || [];
  groups.forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    groupSelect.appendChild(opt);
  });
};

const createSelectors = (zones) => {
  const container = document.getElementById("zones-container");
  container.innerHTML = "";
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
      applyColours(currentLayout, currentStyle);
    });

    row.appendChild(select);
    container.appendChild(row);
  });
};

const extractZones = (styleGroup) => {
  const group = document.getElementById(styleGroup);
  if (!group) return [];
  const uniqueZones = new Set();

  group.querySelectorAll("*[id]").forEach(el => {
    let baseId = el.id;
    const alias = zoneAliasMap[baseId.replace(/^(.*?)(Left|Right)$/, "$1$2")] || baseId;
    uniqueZones.add(alias);
  });

  return Array.from(uniqueZones);
};

const showOnlyStyle = (styleGroup) => {
  const svg = document.querySelector("svg");
  if (!svg) return;
  svg.querySelectorAll("g").forEach(group => {
    group.style.display = (group.id === styleGroup) ? "inline" : "none";
  });
};

const applyColours = (layout, style) => {
  const svg = document.querySelector("svg");
  if (!svg) return;

  const group = document.getElementById(style);
  if (!group) return;

  group.querySelectorAll("*[id]").forEach(part => {
    const id = part.id;
    const baseId = zoneAliasMap[id.replace(/^(.*?)(Left|Right)$/, "$1$2")] || id;
    const patternId = selectedColours[baseId];
    if (patternId) {
      part.setAttribute("fill", `url(#${patternId})`);
    }
  });
};

// Event bindings
document.getElementById("layout-select").addEventListener("change", async (e) => {
  currentLayout = e.target.value;
  if (!currentLayout) return;

  await loadLayout(currentLayout);
  updateStyleOptions(currentLayout);
  document.getElementById("group-select").value = "";
  document.getElementById("zones-container").innerHTML = "";
});

document.getElementById("group-select").addEventListener("change", (e) => {
  currentStyle = e.target.value;
  if (!currentStyle) return;

  showOnlyStyle(currentStyle);
  const zones = extractZones(currentStyle);
  createSelectors(zones);
});

// Screenshot PNG logic
document.getElementById("download-button").addEventListener("click", () => {
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

(async () => {
  await loadSwatches();
})();
