'use client' // Ensure this directive is correctly formatted

import React, { useEffect, useState } from 'react'
import StarFieldContainer from './StarFieldContainer'
import Star from './Star'
import ShootingStar from './ShootingStar'

interface StarFieldProps {
  initialStars: number
  initialShootingStars: number
}

const generateStars = (count: number): React.ReactElement[] => {
  const stars: React.ReactElement[] = []
  for (let i = 0; i < count; i++) {
    const style = {
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 2}s`,
    }
    stars.push(<Star key={`star-${i}`} style={style} />)
  }
  return stars
}

const generateShootingStars = (count: number): React.ReactElement[] => {
  const stars: React.ReactElement[] = []
  for (let i = 0; i < count; i++) {
    const style = {
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 5}s`,
    }
    stars.push(<ShootingStar key={`shooting-star-${i}`} style={style} />)
  }
  return stars
}

const StarField: React.FC<StarFieldProps> = ({ initialStars, initialShootingStars }) => {
  const [stars, setStars] = useState<React.ReactElement[]>([])
  const [shootingStars, setShootingStars] = useState<React.ReactElement[]>([])

  useEffect(() => {
    setStars(generateStars(initialStars))
    setShootingStars(generateShootingStars(initialShootingStars))

    const interval = setInterval(() => {
      setShootingStars(generateShootingStars(initialShootingStars))
    }, 5000)

    return () => clearInterval(interval)
  }, [initialStars, initialShootingStars])

  return (
    <StarFieldContainer>
      {stars}
      {shootingStars}
    </StarFieldContainer>
  )
}

export default StarField
