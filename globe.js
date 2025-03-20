const globeElement = document.getElementById('globe');
const globeContainer = document.getElementById('globe-container');

// Constants for the globe
const R = 3; // Radius of the globe
const width = 200; // Terminal width
const height = 300; // Terminal height
const K1 = 80; // Scaling factor for the screen
const aspectRatio = width / height; // Aspect ratio correction
const chars = ".,-~:;=!*#$@"; // Characters for shading

// Variables for rotation
let A = 0; // Rotation around the X-axis
let B = 0; // Rotation around the Y-axis
let mouseX = 0; // Cursor X position
let mouseY = 0; // Cursor Y position
let isMouseOver = false; // Track if the mouse is over the globe

// Function to render the globe
function renderGlobe() {
    const output = new Array(height).fill(' ').map(() => new Array(width).fill(' '));
    const zbuffer = new Array(height).fill(0).map(() => new Array(width).fill(0));

    for (let theta = 0; theta < 2 * Math.PI; theta += 0.07) {
        for (let phi = 0; phi < Math.PI; phi += 0.02) {
            // 3D coordinates of the point on the sphere
            const x = R * Math.sin(phi) * Math.cos(theta);
            const y = R * Math.sin(phi) * Math.sin(theta);
            const z = R * Math.cos(phi);

            // Rotate around the Y-axis (B) and X-axis (A)
            const x1 = x * Math.cos(B) + z * Math.sin(B);
            const y1 = y * Math.cos(A) - (z * Math.cos(B) - x * Math.sin(B)) * Math.sin(A);
            const z1 = y * Math.sin(A) + (z * Math.cos(B) - x * Math.sin(B)) * Math.cos(A);

            // Project onto 2D screen
            const ooz = 1 / (z1 + 5); // Add an offset to prevent division by zero
            const xp = Math.floor(width / 2 + K1 * ooz * x1);
            const yp = Math.floor(height / 2 - K1 * ooz * y1 * aspectRatio); // Apply aspect ratio correction

            // Ensure xp and yp are within bounds
            if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                // Calculate luminance (lighting effect)
                let L = Math.cos(phi) * Math.cos(theta) * Math.sin(B) - Math.cos(A) * Math.cos(theta) * Math.sin(phi) - Math.sin(A) * Math.sin(theta) + Math.cos(B) * (Math.cos(A) * Math.sin(theta) - Math.cos(theta) * Math.sin(A) * Math.sin(phi));

                // Brighten the area under the cursor
                if (isMouseOver) {
                    const dx = xp - mouseX;
                    const dy = yp - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Increase luminance near the cursor (more prominent effect)
                    if (distance < 20) { // Larger highlight radius
                        L += 2 - distance / 10; // Stronger brightness boost
                    }
                }

                if (L > 0) {
                    if (ooz > zbuffer[yp][xp]) {
                        zbuffer[yp][xp] = ooz;
                        const luminance_index = Math.floor(L * 8);
                        output[yp][xp] = chars[Math.min(luminance_index, chars.length - 1)]; // Ensure index is within bounds
                    }
                }
            }
        }
    }

    // Draw the globe
    globeElement.textContent = output.map(row => row.join('')).join('\n');
}

// Auto-rotate the globe
function autoRotate() {
    A += 0.005; // Rotate around the X-axis
    B += 0.0025; // Rotate around the Y-axis
    renderGlobe();
    requestAnimationFrame(autoRotate);
}

// Handle mouse movement
globeContainer.addEventListener('mousemove', (event) => {
    isMouseOver = true;

    // Get cursor position relative to the globe container
    const rect = globeContainer.getBoundingClientRect();
    mouseX = Math.floor((event.clientX - rect.left) * (width / rect.width)); // Map to globe width
    mouseY = Math.floor((event.clientY - rect.top) * (height / rect.height)); // Map to globe height
});

// Reset when mouse leaves the globe
globeContainer.addEventListener('mouseleave', () => {
    isMouseOver = false;
});

// Start the animation
autoRotate();
