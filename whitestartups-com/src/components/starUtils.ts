import React from 'react';
import Star from './Star';
import ShootingStar from './ShootingStar';

export const generateStars = (count: number): React.ReactElement[] => {
  const stars: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    const style = {
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 2}s`,
    };
    stars.push(React.createElement(Star, { key: `star-${i}`, style }));
  }
  return stars;
};

export const generateShootingStars = (count: number): React.ReactElement[] => {
  const stars: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    const style = {
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 5}s`,
    };
    stars.push(React.createElement(ShootingStar, { key: `shooting-star-${i}`, style }));
  }
  return stars;
};
