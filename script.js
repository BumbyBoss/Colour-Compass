let swatches = [];
let selectedColours = {};

const layoutMap = {
  grid: [
    "zone-1", "zone-2", "zone-3",
    "zone-4", "zone-5", "zone-6",
    "zone-7", "zone-8", "zone-9"
  ],
  diaper: {
    Abrazo: ["AZBody", "AZLeftTab", "AZRightTab"],
    TraditionalDC: ["TDCBody", "TDCWaistband", "TDCLeftCuff", "TDCRightCuff"],
    Brief: ["BriefBody", "BriefWaistband", "BriefLeftCuff", "BriefRightCuff"]
  },
  kidpants: {
    HaremPants: ["HPBody", "HPWaist", "HPLeftCuff", "HPRightCuff"],
    LeggingPants: ["LPBody", "LPWaist"],
    JoggersPants: ["JPBody", "JPWaist", "JPLeftCuff", "JPRightCuff"],
    RufflePants: ["RPBody", "RPWaist"],
    HemmedPants: ["HPBody", "HPWaist"],
    CuffedPants: ["CPBody", "CPWaist", "CPLeftCuff", "CPRightCuff"],
    EuroHemmedPants: ["EHBody", "EHWaist"],
    EuroCuffedPants: ["ECBody", "ECWaist", "ECLeftCuff", "ECRightCuff"],
    EuroSweatPants: ["ESPBody", "ESPWaist", "ESPLeftCuff", "ESPRightCuff"],
    BritchesPants: ["BPBody", "BPWaist", "BPLeftLeg", "BPRightLeg"],
    FootiesPants: ["FPBody", "FPWaist", "FPLeftFoot", "FPRightFoot"],
    BootcutPants: ["BCPBody", "BCPWaist"]
  },
  kidcrops: {
    HemmedCrop: ["HCBody", "HCWaist"],
    HemmedEuroCrop: ["HECBody", "HECWaist"],
    DigsCrop: ["DigsBody", "DigsWaist", "DigsLeftCuff", "DigsRightCuff"],
    CuffedCrop: ["CCBody", "CCWaist", "CCLeftCuff", "CCRightCuff"],
    CuffedEuroCrop: ["CECBody", "CECWaist", "CECLeftCuff", "CECRightCuff"],
    RuffleCrop: ["RCBody", "RCWaist"]
  },
  kidshorts: {
    HemmedShorts: ["HSBody", "HSWaist"],
    CuffedShorts: ["CSBody", "CSWaist", "Cuffs"],
    RuffledShorts: ["RSBody", "RSWaist"],
    BloomerShorts: ["BSBody", "BSWaist", "Cuffs"],
    Skirtie: ["SkBody", "SkWaist"]
  },
  sweater: {
    CampfireSweater: ["CampfireBody", "CampfireLeftSleeve", "CampfireRightSleeve", "CampfireLeftCuff", "CampfireRightCuff", "CampfireBottomCuff", "CampfireNeck"],
    CardiganSweater: ["CardiganSweaterBody", "CardiganLeftSleeve", "CardiganRightSleeve", "CardiganLeftCuff", "CardiganRightCuff", "CardiganBottomCuff", "Neck"],
    CocoonSweater: ["CocoonBody", "CocoonLeftSleeve", "CocoonRightSleeve", "CocoonLeftCuff", "CocoonRightCuff", "CocoonTrim"],
    CrewNeckSweater: ["CrewNeckSweaterBody", "CrewNeckLeftSleeve", "CrewNeckRightSleeve", "CrewNeckLeftCuff", "CrewNeckRightCuff", "CrewNeckBottomCuff", "CrewNeck"],
    HalfZipSweater: ["HalfZipSweaterBody", "HalfZipLeftSleeve", "HalfZipRightSleeve", "HalfZipLeftCuff", "HalfZipRightCuff", "HalfZipBottomCuff", "Neck"],
    HenleySweater: ["HenleySweaterBody", "HenleyLeftSleeve", "HenleyRightSleeve", "HenleyLeftCuff", "HenleyRightCuff", "HenleyBottomCuff", "Neck"],
    ShawlNeckSweater: ["ShawlSweaterBody", "ShawlLeftSleeve", "ShawlRightSleeve", "ShawlLeftCuff", "ShawlRightCuff", "ShawlBottomCuff", "ShawlTrim"],
    SheepyHugSweater: ["SheepySweaterBody", "SheepyLeftSleeve", "SheepyRightSleeve", "SheepyLeftCuff", "SheepyRightCuff", "SheepyBottomCuff", "SheepyHugHood"],
    QuarterSweater: ["QuarterSweaterBody", "QuarterLeftSleeve", "QuarterRightSleeve", "QuarterLeftCuff", "QuarterRightCuff", "QuarterBottomCuff", "Neck"],
    Vest: ["VestChest", "VestLeftSidePanel", "VestRightSidePanel", "VestLowerTorso", "VestBottomCuff", "Neck"]
  }
};
const loadLayout = async (layout) => {
  const displayArea = document.getElementById("display-area");
  displayArea.innerHTML = "";
  try {
    const res = await fetch(`Resources/SVG/${layout}.svg`);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;
    const svg = document.querySelector("svg");
    svg.classList.add("svg-display");

    // Hide all SVG parts by default
    svg.querySelectorAll("*[id]").forEach(part => {
      part.style.display = "none";
      part.style.cursor = "";
    });
    // Set up click logic
    svg.querySelectorAll("*[id]").forEach(part => {
      part.addEventListener("click", () => {
        if (currentFillTarget) currentFillTarget.style.stroke = "";
        currentFillTarget = part;
        part.style.stroke = "#000";
      });
    });

    highlightParts(); // Only show valid ones
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${layout}</p>`;
  }
};
function highlightParts() {
  const layout = layoutSelect.value;
  const style = styleSelect.value;
  const parts = layoutMap[layout]?.[style];
  if (!parts) return;

  const svg = document.querySelector("svg");

  // Show only valid parts
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
