'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as Comlink from 'comlink';
import '../styles/sun.css';
const StarField = dynamic(() => import('./StarField'), {
    ssr: false,
});
const TunnelEffect = dynamic(() => import('./TunnelEffect'), {
    ssr: false,
});
const SolarSystem = dynamic(() => import('./SolarSystem'), {
    ssr: false,
});
const ClientGraphics = ({ initialStars, initialShootingStars }) => {
    const [showTunnelEffect, setShowTunnelEffect] = useState(false);
    const canvasRef = useRef(null);
    const offscreenCanvasRef = useRef(null);
    useEffect(() => {
        const starFieldWorker = new Worker(new URL('../workers/starFieldWorker.ts', import.meta.url));
        const tunnelEffectWorker = new Worker(new URL('../workers/tunnelEffectWorker.ts', import.meta.url));
        const ringWorker = new Worker(new URL('../workers/ringWorker.ts', import.meta.url));
        const starField = Comlink.wrap(starFieldWorker);
        const tunnelEffect = Comlink.wrap(tunnelEffectWorker);
        const rings = Comlink.wrap(ringWorker);
        const renderStarField = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield starField.renderStarField(initialStars, initialShootingStars);
            }
            catch (error) {
                console.error('Error rendering star field:', error);
            }
        });
        renderStarField(); // Initial render
        const interval = setInterval(renderStarField, 3000); // Refresh every 3 seconds
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            setShowTunnelEffect(true);
            if (canvasRef.current && !offscreenCanvasRef.current) {
                offscreenCanvasRef.current = canvasRef.current.transferControlToOffscreen();
                try {
                    yield tunnelEffect.initializeCanvas(offscreenCanvasRef.current, canvasRef.current.width, canvasRef.current.height, [offscreenCanvasRef.current]);
                    yield tunnelEffect.renderRing(0, 10); // Example call to renderRing
                }
                catch (error) {
                    console.error('Error initializing and rendering tunnel effect:', error);
                }
            }
            try {
                yield rings.renderRings();
            }
            catch (error) {
                console.error('Error rendering rings:', error);
            }
        }), 15000); // 15 seconds
        const tunnelInterval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            if (offscreenCanvasRef.current) {
                try {
                    yield tunnelEffect.renderRing(0, 10); // Example call to renderRing
                }
                catch (error) {
                    console.error('Error re-rendering tunnel effect:', error);
                }
            }
        }), 4000); // Re-invoke every 4 seconds
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
            clearInterval(tunnelInterval);
            starFieldWorker.terminate();
            tunnelEffectWorker.terminate();
            ringWorker.terminate();
        };
    }, [initialStars, initialShootingStars]);
    return (<div className="fullscreen-background">
      <StarField initialStars={initialStars} initialShootingStars={initialShootingStars}/>
      {showTunnelEffect && <TunnelEffect />} {/* Render TunnelEffect after 15 seconds */}
      <SolarSystem /> {/* Render the SolarSystem component */}
      <canvas ref={canvasRef} width={800} height={600}/> {/* Canvas for off-screen rendering */}
    </div>);
};
export default ClientGraphics;
//# sourceMappingURL=ClientGraphics.jsx.map