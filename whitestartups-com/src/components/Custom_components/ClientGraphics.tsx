'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import * as Comlink from 'comlink'
import CircularGraphic from '@components/CircularGraphic'
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

export default ClientGraphics
