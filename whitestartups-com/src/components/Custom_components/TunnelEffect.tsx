import React, { useEffect } from 'react'
import styles from '@styles/custom_styles/TunnelEffect.module.css'
import { tunnelEffectWorker } from '@workers/tunnelEffectWorker'

const TunnelEffect: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('tunnel-container') as HTMLElement
    if (container) {
      const canvas = document.createElement('canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.className = styles.tunnelRing
      container.appendChild(canvas)

      const offscreenCanvas = canvas.transferControlToOffscreen()
      tunnelEffectWorker.initializeCanvas(offscreenCanvas, window.innerWidth, window.innerHeight, [
        offscreenCanvas,
      ])
    }
  }, [])

  return <div id="tunnel-container" className={styles.tunnelContainer}></div>
}

export default TunnelEffect
