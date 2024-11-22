import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
const Spaceship = () => {
    const mountRef = useRef(null);
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount)
            return;
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // soft white light
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        // Function to create a spaceship model
        const createSpaceship = () => {
            const spaceship = new THREE.Group();
            // Central hull
            const hullGeometry = new THREE.CylinderGeometry(1, 1, 12, 32);
            const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
            const hull = new THREE.Mesh(hullGeometry, hullMaterial);
            hull.rotation.x = Math.PI / 2;
            spaceship.add(hull);
            // Forward prongs
            const prongGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 32);
            const prongMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
            const prong1 = new THREE.Mesh(prongGeometry, prongMaterial);
            prong1.position.set(0, 3, 6);
            prong1.rotation.z = Math.PI / 2;
            spaceship.add(prong1);
            const prong2 = new THREE.Mesh(prongGeometry, prongMaterial);
            prong2.position.set(2.6, -1.5, 6);
            prong2.rotation.z = Math.PI / 2;
            spaceship.add(prong2);
            const prong3 = new THREE.Mesh(prongGeometry, prongMaterial);
            prong3.position.set(-2.6, -1.5, 6);
            prong3.rotation.z = Math.PI / 2;
            spaceship.add(prong3);
            // Rear engine section
            const engineGeometry = new THREE.SphereGeometry(2, 32, 32);
            const engineMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
            const engine = new THREE.Mesh(engineGeometry, engineMaterial);
            engine.position.set(0, 0, -7);
            spaceship.add(engine);
            return spaceship;
        };
        // Create 50 spaceships at random points in the orbit
        const spaceships = [];
        for (let i = 0; i < 50; i++) {
            const spaceship = createSpaceship();
            const angle = Math.random() * 2 * Math.PI;
            const radius = 50 + Math.random() * 50; // Random radius between 50 and 100
            spaceship.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
            scene.add(spaceship);
            spaceships.push(spaceship);
        }
        // Camera position
        camera.position.z = 150;
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            spaceships.forEach((spaceship) => {
                spaceship.rotation.y += 0.01; // Rotate each spaceship
            });
            renderer.render(scene, camera);
        };
        animate();
        // Handle window resize
        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
        };
    }, []);
    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}/>;
};
export default Spaceship;
//# sourceMappingURL=Spaceship.jsx.map