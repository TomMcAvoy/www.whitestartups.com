import { createElement } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
// Define keyframes for rotation animation
const rotate = keyframes `
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
// Define styled components
const SolarSystemContainer = styled.div `
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw; /* Full width of the viewport */
  height: 100vh; /* Full height of the viewport */
  background: transparent; /* Transparent background */
  overflow: hidden;
  z-index: 10000; /* Ensure z-index is greater than 9999 */
`;
const Sun = styled.div `
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: url('/images/sun.gif') no-repeat center center;
  background-size: contain;
  transform: translate(-50%, -50%);
`;
const Planet = styled.div `
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: url(${(props) => props.image}) no-repeat center center;
  background-size: contain;
  transform: translate(-50%, -50%);
  animation: ${rotate} ${(props) => props.duration}s linear infinite;
  transform-origin: ${(props) => props.distance}px;
`;
const SolarSystem = () => {
    // Scaling factor to fit the distances within the component
    const scale = 50;
    return createElement(SolarSystemContainer, null, createElement(Sun, null), createElement(Planet, {
        size: 10,
        distance: 0.39 * scale,
        duration: 5,
        image: '/images/mercury.gif',
    }), // Mercury
    createElement(Planet, {
        size: 20,
        distance: 0.72 * scale,
        duration: 7,
        image: '/images/venus.gif',
    }), // Venus
    createElement(Planet, {
        size: 20,
        distance: 1.0 * scale,
        duration: 10,
        image: '/images/earth.gif',
    }), // Earth
    createElement(Planet, {
        size: 15,
        distance: 1.52 * scale,
        duration: 12,
        image: '/images/mars.gif',
    }), // Mars
    createElement(Planet, {
        size: 50,
        distance: 5.2 * scale,
        duration: 20,
        image: '/images/jupiter.gif',
    }), // Jupiter
    createElement(Planet, {
        size: 45,
        distance: 9.58 * scale,
        duration: 25,
        image: '/images/saturn.gif',
    }), // Saturn
    createElement(Planet, {
        size: 35,
        distance: 19.22 * scale,
        duration: 30,
        image: '/images/uranus.gif',
    }), // Uranus
    createElement(Planet, {
        size: 35,
        distance: 30.05 * scale,
        duration: 35,
        image: '/images/neptune.gif',
    }), // Neptune
    createElement(Planet, {
        size: 10,
        distance: 39.48 * scale,
        duration: 40,
        image: '/images/pluto.gif',
    }));
};
export default SolarSystem;
//# sourceMappingURL=SolarSystem.jsx.map