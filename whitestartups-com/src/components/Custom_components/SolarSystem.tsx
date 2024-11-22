import React, { createElement } from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import StarFieldContainer from '@custom_components/StarFieldContainer'
import Star from '@custom_components/Star'
import ShootingStar from '@custom_components/ShootingStar'
import Rings from '@custom_components/Rings'
import TunnelEffect from '@custom_components/TunnelEffect'

// Define keyframes for rotation animation
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

// Define styled components
const SolarSystemContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw; /* Full width of the viewport */
  height: 100vh; /* Full height of the viewport */
  background: transparent; /* Transparent background */
  overflow: hidden;
  z-index: 10000; /* Ensure z-index is greater than 9999 */
`

const Sun = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: url('/images/sun.gif') no-repeat center center;
  background-size: contain;
  transform: translate(-50%, -50%);
`

const Planet = styled.div<{ size: number; distance: number; duration: number; image: string }>`
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
`

const SolarSystem: React.FC = () => {
  return (
    <SolarSystemContainer>
      <Sun />
      <Planet size={50} distance={200} duration={10} image="/images/planet1.png" />
      <Planet size={30} distance={300} duration={20} image="/images/planet2.png" />
      <StarFieldContainer>
        <Star />
        <ShootingStar />
      </StarFieldContainer>
      <TunnelEffect />
      <Rings count={7} />
    </SolarSystemContainer>
  )
}

export default SolarSystem
