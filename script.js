let currentFillTarget = null;

// === Load default SVG ===
fetch('Resources/SVG/sweater.svg')
  .then(response => {
    if (!response.ok) throw new Error('SVG file not found');
    return response.text();
  })
  .then(svgText => {
    document.getElementById('svgContainer').innerHTML = svgText;

    // Optional: Set default fill target to first part in SVG
    const firstPath = document.querySelector('#svgContainer svg path');
    if (firstPath) {
      currentFillTarget = firstPath;
      firstPath.style.stroke = "#000"; // Visual indicator
    }

    // Add click listeners to SVG parts
    document.querySelectorAll('#svgContainer svg path').forEach(part => {
      part.addEventListener('click', () => {
        if (currentFillTarget) currentFillTarget.style.stroke = ""; // Remove old highlight
        currentFillTarget = part;
        part.style.stroke = "#000"; // Highlight selected part
      });
    });
  })
  .catch(error => {
    console.error('Error loading SVG:', error);
    document.getElementById('svgContainer').innerHTML = '<p>Unable to load garment template.</p>';
  });

// === Load swatches from JSON ===
fetch('swatches.json')
  .then(response => {
    if (!response.ok) throw new Error('Swatch data missing');
    return response.json();
  })
  .then(swatches => {
    const swatchList = document.getElementById('swatchList');
    swatches.forEach(swatch => {
      const swatchEl = document.createElement('div');
      swatchEl.classList.add('swatch');
      swatchEl.style.backgroundColor = swatch.hex || swatch.color;

      swatchEl.title = swatch.name;
      swatchEl.addEventListener('click', () => {
        if (currentFillTarget) {
          currentFillTarget.style.fill = swatch.hex || swatch.color;
        }
      });

      swatchList.appendChild(swatchEl);
    });
  })
  .catch(error => {
    console.error('Error loading swatches:', error);
  });
