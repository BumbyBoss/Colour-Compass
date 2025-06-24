// FILE: script.js
// LOCATION: Colour-Compass/script.js

let swatches = [];
let selectedColours = {};

const structure = {
  grid: [], // last priority
  diaper: ["Abrazo", "TraditionalDC", "Brief"],
  kidcrops: ["HemmedCrop", "HemmedEuroCrop", "DigsCrop", "CuffedCrop", "CuffedEuroCrop", "RuffleCrop"],
  kidpants: ["HaremPants", "LeggingPants", "JoggersPants", "RufflePants", "HemmedPants", "CuffedPants", "EuroHemmedPants", "EuroCuffedPants", "EuroSweatPants", "BritchesPants", "FootiesPants", "BootcutPants"],
  kidshorts: ["HemmedShorts", "CuffedShorts", "RuffledShorts", "BloomerShorts", "Skirtie"],
  sweater: [
    "CampfireSweater", "CardiganSweater", "CocoonSweater", "CrewNeckSweater",
    "HalfZipSweater", "HenleySweater", "ShawlNeckSweater", "SheepyHugSweater",
    "QuarterSweater", "Vest"
  ]
};

const mergedZones = (svg, groupId) => {
  const zoneGroups = {
    Cuff: ["Cuff", "LeftCuff", "RightCuff"],
    Sleeve: ["LeftSleeve", "RightSleeve"],
    SidePanel: ["LeftSidePanel", "RightSidePanel"],
    Leg: ["LeftLeg", "RightLeg"],
    Foot: ["LeftFoot", "RightFoot"],
    Tab: ["LeftTab", "RightTab"]
  };
  const all = Array.from(svg.querySelectorAll(`#${groupId} *`));
  const final = [];
  const used = new Set();

  all.forEach(el => {
    const id = el.id;
    if (!id || used.has(id)) return;

    for (let label in zoneGroups) {
      const group = zoneGroups[label];
      if (group.some(g => id.includes(g))) {
        if (!used.has(label)) {
          final.push(label);
          used.add(label);
        }
        used.add(id);
        return;
      }
    }
    final.push(id);
    used.add(id);
  });
  return final;
};

const loadLayout = async (layout) => {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  try {
    const res = await fetch(`resources/SVG/${layout}.svg`);
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

const createSelectors = (zones, groupId) => {
  const selectorSection = document.querySelector(".selector");
  document.querySelectorAll(".swatch-row").forEach(row => row.remove());
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
      applyColours(groupId);
    });

    row.appendChild(select);
    selectorSection.appendChild(row);
  });
};

const applyColours = (groupId) => {
  const svg = document.querySelector("svg");
  if (!svg) return;

  Object.entries(selectedColours).forEach(([zoneId, patternId]) => {
    const zone = svg.getElementById(zoneId);
    if (zone && patternId) {
      zone.setAttribute("fill", `url(#${patternId})`);
    }
  });
};

const categorySelect = document.getElementById("layout-select");
const groupSelect = document.getElementById("group-select");

categorySelect.addEventListener("change", async (e) => {
  const layout = e.target.value;
  groupSelect.innerHTML = "<option disabled selected>Select a Style</option>";
  document.querySelector(".selector").innerHTML = "";

  await loadLayout(layout);
  const svg = document.querySelector("svg");
  if (!svg || !structure[layout]) return;

  structure[layout].forEach(groupId => {
    if (svg.getElementById(groupId)) {
      const option = document.createElement("option");
      option.value = groupId;
      option.textContent = groupId.replace(/([A-Z])/g, ' $1').trim();
      groupSelect.appendChild(option);
    }
  });

  groupSelect.style.display = "block";
});

groupSelect.addEventListener("change", () => {
  const selectedGroup = groupSelect.value;
  const svg = document.querySelector("svg");
  if (!svg) return;
  const zones = mergedZones(svg, selectedGroup);
  createSelectors(zones, selectedGroup);
});

// Download button logic (as PNG)
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

(async () => {
  await loadSwatches();
})();
