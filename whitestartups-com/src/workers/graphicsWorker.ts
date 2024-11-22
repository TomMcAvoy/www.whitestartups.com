import * as Comlink from 'comlink';

const graphicsWorker = {
  renderStarField(initialStars, initialShootingStars) {
    // Implement the logic to render the star field
    console.log(`Rendering star field with ${initialStars} stars and ${initialShootingStars} shooting stars.`);
  },
  renderTunnelEffect() {
    // Implement the logic to render the tunnel effect
    console.log('Rendering tunnel effect.');
  },
};

Comlink.expose(graphicsWorker);
