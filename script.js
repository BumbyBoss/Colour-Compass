// Fetch and insert the SVG into the container
fetch('Resources/SVG/component-template.svg')
  .then(response => {
    if (!response.ok) {
      throw new Error('SVG file not found');
    }
    return response.text();
  })
  .then(svgText => {
    document.getElementById('svgContainer').innerHTML = svgText;
  })
  .catch(error => {
    console.error('Error loading SVG:', error);
    document.getElementById('svgContainer').innerHTML = '<p>Unable to load garment template.</p>';
  });
