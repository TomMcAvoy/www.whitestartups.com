import React, { useEffect, useRef } from 'react'
import * as Comlink from 'comlink'
import { TunnelEffectWorker } from '../types/tunnelEffectWorkerTypes'
import styles from '@styles/custom_styles/TunnelEffect.module.css'

const TunnelEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const worker = new Worker(new URL('../workers/tunnelEffectWorker.ts', import.meta.url))
    const tunnelEffectWorker = Comlink.wrap<TunnelEffectWorker>(worker)

    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.className = styles.tunnelRing
    container.appendChild(canvas)

    const offscreenCanvas = canvas.transferControlToOffscreen()
    tunnelEffectWorker
      .initializeCanvas(offscreenCanvas, window.innerWidth, window.innerHeight, [offscreenCanvas])
      .then(() => {
        const numRings = 20
        for (let i = 0; i < numRings; i++) {
          tunnelEffectWorker.renderRing(i, numRings)
        }
      })

    return () => {
      worker.terminate()
      container.innerHTML = ''
    }
  }, [])

  return <div className={styles.tunnelEffectContainer} ref={containerRef} />
}

export default TunnelEffect
