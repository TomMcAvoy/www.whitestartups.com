'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import * as Comlink from 'comlink'
import styles from '@styles/CircularGraphic.module.css'
import '../styles/sun.css'

const StarField = dynamic(() => import('@components/StarField'), {
  ssr: false,
})

const TunnelEffect = dynamic(() => import('./TunnelEffect'), {
  ssr: false,
})

const SolarSystem = dynamic(() => import('./SolarSystem'), {
  ssr: false,
})

interface ClientGraphicsProps {
  initialStars: number
  initialShootingStars: number
}

interface StarFieldWorker {
  renderStarField: (initialStars: number, initialShootingStars: number) => Promise<void>
}

interface TunnelEffectWorker {
  initializeCanvas: (
    canvas: OffscreenCanvas,
    width: number,
    height: number,
    transfer: Transferable[],
  ) => Promise<void>
  renderRing: (index: number, numRings: number) => Promise<void>
}

interface RingWorker {
  renderRings: () => Promise<void>
}

const ClientGraphics: React.FC<ClientGraphicsProps> = ({ initialStars, initialShootingStars }) => {
  const [showTunnelEffect, setShowTunnelEffect] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null)

  useEffect(() => {
    const starFieldWorker = new Worker(new URL('../workers/starFieldWorker.ts', import.meta.url))
    const tunnelEffectWorker = new Worker(
      new URL('../workers/tunnelEffectWorker.ts', import.meta.url),
    )
    const ringWorker = new Worker(new URL('../workers/ringWorker.ts', import.meta.url))

    const starField = Comlink.wrap<StarFieldWorker>(starFieldWorker)
    const tunnelEffect = Comlink.wrap<TunnelEffectWorker>(tunnelEffectWorker)
    const rings = Comlink.wrap<RingWorker>(ringWorker)

    const renderStarField = async () => {
      try {
        await starField.renderStarField(initialStars, initialShootingStars)
      } catch (error) {
        console.error('Error rendering star field:', error)
      }
    }

    renderStarField() // Initial render

    const interval = setInterval(renderStarField, 3000) // Refresh every 3 seconds

    const timer = setTimeout(async () => {
      setShowTunnelEffect(true)
      if (canvasRef.current && !offscreenCanvasRef.current) {
        offscreenCanvasRef.current = canvasRef.current.transferControlToOffscreen()
        try {
          await tunnelEffect.initializeCanvas(
            offscreenCanvasRef.current,
            canvasRef.current.width,
            canvasRef.current.height,
            [offscreenCanvasRef.current],
          )
          await tunnelEffect.renderRing(0, 10) // Example call to renderRing
        } catch (error) {
          console.error('Error initializing and rendering tunnel effect:', error)
        }
      }
      try {
        await rings.renderRings()
      } catch (error) {
        console.error('Error rendering rings:', error)
      }
    }, 15000) // 15 seconds

    const tunnelInterval = setInterval(async () => {
      if (offscreenCanvasRef.current) {
        try {
          await tunnelEffect.renderRing(0, 10) // Example call to renderRing
        } catch (error) {
          console.error('Error re-rendering tunnel effect:', error)
        }
      }
    }, 4000) // Re-invoke every 4 seconds

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
      clearInterval(tunnelInterval)
      starFieldWorker.terminate()
      tunnelEffectWorker.terminate()
      ringWorker.terminate()
    }
  }, [initialStars, initialShootingStars])

  return (
    <div className="fullscreen-background">
      <StarField initialStars={initialStars} initialShootingStars={initialShootingStars} />
      {showTunnelEffect && <TunnelEffect />} {/* Render TunnelEffect after 15 seconds */}
      <SolarSystem /> {/* Render the SolarSystem component */}
      <canvas ref={canvasRef} width={800} height={600} /> {/* Canvas for off-screen rendering */}
      <CircularGraphic /> {/* Render the CircularGraphic component */}
    </div>
  )
}

type Vendor = {
  name: string
  logo: string
  description: string
  useCase: string
  businessCase: string
}

const vendors: Vendor[] = [
  {
    name: 'Microsoft Azure AD',
    logo: '/images/azure-ad-logo.png',
    description: 'Azure AD description',
    useCase: 'Azure AD use case',
    businessCase: 'Azure AD business case',
  },
  {
    name: 'Okta',
    logo: '/images/okta-logo.png',
    description: 'Okta description',
    useCase: 'Okta use case',
    businessCase: 'Okta business case',
  },
  // Add more vendors here...
]

const CircularGraphic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    console.log('CircularGraphic component mounted')
    const container = containerRef.current
    if (!container) {
      console.error('Container ref is null')
      return
    }

    const radius = container.offsetWidth / 2
    const angleStep = (2 * Math.PI) / vendors.length

    vendors.forEach((vendor, index) => {
      const angle = index * angleStep
      const x = radius + radius * Math.cos(angle) - 50 // Adjust for logo size
      const y = radius + radius * Math.sin(angle) - 50 // Adjust for logo size

      const node = document.createElement('div')
      node.className = styles.node
      node.style.transform = `translate(${x}px, ${y}px)`
      node.innerHTML = `<img src="${vendor.logo}" alt="${vendor.name}" />`
      node.addEventListener('click', () => {
        console.log(`Vendor clicked: ${vendor.name}`)
        setSelectedVendor(vendor)
      })

      container.appendChild(node)
    })

    const interval = setInterval(() => {
      const currentAngle =
        parseFloat(container.style.transform.replace('rotate(', '').replace('deg)', '')) || 0
      const newAngle = currentAngle + 45 // Rotate by 45 degrees
      container.style.transform = `rotate(${newAngle}deg)`
      console.log(`Rotating to angle: ${newAngle}`)
    }, 2000) // Rotate every 2 seconds

    return () => {
      console.log('CircularGraphic component unmounted')
      clearInterval(interval)
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.container}>
        <p>Loading Circular Graphic...</p>
      </div>
      {selectedVendor && (
        <div className={styles.popup}>
          <h2>{selectedVendor.name}</h2>
          <p>{selectedVendor.description}</p>
          <p>
            <strong>Use Case:</strong> {selectedVendor.useCase}
          </p>
          <p>
            <strong>Business Case:</strong> {selectedVendor.businessCase}
          </p>
          <button onClick={() => setSelectedVendor(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

export default ClientGraphics
