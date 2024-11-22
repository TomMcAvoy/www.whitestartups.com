var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Comlink from 'comlink';
import * as THREE from 'three';
let renderer;
let scene;
let camera;
const tunnelEffectWorker = {
    initializeCanvas(canvas, width, height, transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('initializeCanvas called with parameters:', { width, height });
            try {
                renderer = new THREE.WebGLRenderer({ canvas });
                renderer.setSize(width, height);
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                camera.position.z = 200; // Move the camera further away
                console.log('Canvas initialized');
            }
            catch (error) {
                console.error('Error initializing canvas:', error);
            }
        });
    },
    renderRing(index, numRings) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('renderRing called with parameters:', { index, numRings });
            if (!renderer || !scene || !camera) {
                console.error('Renderer, scene, or camera is not initialized.');
                return;
            }
            try {
                const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
                const maxRadius = Math.min(renderer.domElement.width, renderer.domElement.height) / 2;
                const ringWidth = maxRadius / numRings;
                const color = colors[index % colors.length];
                const radius = maxRadius - index * ringWidth;
                const rotation = (index * Math.PI) / 6;
                const geometry = new THREE.TorusGeometry(radius, ringWidth / 2, 8, 50);
                const material = new THREE.MeshBasicMaterial({ color });
                const torus = new THREE.Mesh(geometry, material);
                torus.rotation.x = Math.PI / 2;
                torus.rotation.z = rotation;
                torus.position.z = -index * ringWidth; // Position the rings along the z-axis
                scene.add(torus);
                try {
                    // Render the scene once
                    renderer.render(scene, camera);
                }
                catch (error) {
                    console.error('Error in renderRing:', error);
                }
            }
            catch (error) {
                console.error('Error in renderRing:', error);
            }
        });
    },
};
Comlink.expose(tunnelEffectWorker);
//# sourceMappingURL=tunnelEffectWorker.js.map