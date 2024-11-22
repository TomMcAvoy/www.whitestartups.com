import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
const shoot = keyframes `
  0% { transform: translate(0, 0); }
  100% { transform: translate(100vw, 100vh); }
`;
const ShootingStar = styled.div `
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: ${shoot} 1s linear infinite;
`;
export default ShootingStar;
//# sourceMappingURL=ShootingStar.jsx.map