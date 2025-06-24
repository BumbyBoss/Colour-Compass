// FILE: script.js
// LOCATION: Colour-Compass/script.js

let swatches = [];
let currentLayout = 'grid';
let selectedColours = Array(9).fill(null);

// Dynamically load the selected layout SVG
const loadLayout = async (layout) => {
  const displayArea = document.getElementById('display-area');
  displayArea.innerHTML = '';
  try {
    const res = await fetch(`svg/${layout}.svg`);
    const svgText = await res.text();
    displayArea.innerHTML = svgText;
    applyColours();
  } catch (err) {
    displayArea.innerHTML = `<p>Error loading layout: ${layout}</p>`;
  }
};

// Load swatch data from swatches.json
const loadSwatches = async () => {
  try {
    const res = await fetch('swatches.json');
    swatches = await res.json();
  } catch (err) {
    console.error('Failed to load swatches:', err);
  }
};

// Populate selectors for each swatch area
const createSelectors = () => {
  const selectorSection = document.querySelector('.selector');
  // Remove old selectors if re-rendering
  document.querySelectorAll('.swatch-row').forEach(row => row.remove());

  for (let i = 0; i < selectedColours.length; i++) {
    const row = document.createElement('div');
    row.className = 'swatch-row';

    const label = document.createElement('label');
    label.textContent = `Select #${i + 1}`;
    row.appendChild(label);

    const select = document.createElement('select');
    select.dataset.index = i;

    swatches.forEach(swatch => {
      const option = document.createElement('option');
      option.value = swatch.svgPatternId || '';
      option.textContent = swatch.name || 'Choose a colour';
      if (swatch.imageUrl) {
        option.dataset.image = swatch.imageUrl;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', handleSelection);
    row.appendChild(select);
    selectorSection.appendChild(row);
  }
};

// Fill the SVG with colours
const applyColours = () => {
  const svg = document.querySelector('svg');
  if (!svg) return;

  selectedColours.forEach((colourId, i) => {
    if (!colourId) return;

    const area = svg.getElementById(`zone-${i + 1}`);
    if (area) {
      area.setAttribute('fill', `url(#${colourId})`);
    }
  });
};

// When user selects a colour
const handleSelection = (e) => {
  const index = +e.target.dataset.index;
  const selectedId = e.target.value;
  selectedColours[index] = selectedId;
  applyColours();
};

// Layout selector change
document.getElementById('layout-select').addEventListener('change', async (e) => {
  currentLayout = e.target.value;
  selectedColours = Array(9).fill(null);
  await loadLayout(currentLayout);
  createSelectors();
});

// Initial load
(async () => {
  await loadSwatches();
  await loadLayout(currentLayout);
  createSelectors();
})();
