import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const twinkle = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const Star = styled.div`
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  animation: ${twinkle} 2s infinite ease-in-out;
`;

export default Star;
