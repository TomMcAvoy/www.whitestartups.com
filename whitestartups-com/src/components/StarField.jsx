'use client'; // Ensure this directive is correctly formatted
import React, { useEffect, useState } from 'react';
import StarFieldContainer from './StarFieldContainer';
import Star from './Star';
import ShootingStar from './ShootingStar';
const generateStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
        const style = {
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 2}s`,
        };
        stars.push(<Star key={`star-${i}`} style={style}/>);
    }
    return stars;
};
const generateShootingStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
        const style = {
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 5}s`,
        };
        stars.push(<ShootingStar key={`shooting-star-${i}`} style={style}/>);
    }
    return stars;
};
const StarField = ({ initialStars, initialShootingStars }) => {
    const [stars, setStars] = useState([]);
    const [shootingStars, setShootingStars] = useState([]);
    useEffect(() => {
        setStars(generateStars(initialStars));
        setShootingStars(generateShootingStars(initialShootingStars));
        const interval = setInterval(() => {
            setShootingStars(generateShootingStars(initialShootingStars));
        }, 5000);
        return () => clearInterval(interval);
    }, [initialStars, initialShootingStars]);
    return (<StarFieldContainer>
      {stars}
      {shootingStars}
    </StarFieldContainer>);
};
export default StarField;
//# sourceMappingURL=StarField.jsx.map