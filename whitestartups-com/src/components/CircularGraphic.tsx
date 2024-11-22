import React, { useEffect, useRef, useState } from 'react'
import styles from '@styles/CircularGraphic.module.css'

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
    const container = containerRef.current
    if (!container) return

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
      node.addEventListener('click', () => setSelectedVendor(vendor))

      container.appendChild(node)
    })

    const interval = setInterval(() => {
      const currentAngle =
        parseFloat(container.style.transform.replace('rotate(', '').replace('deg)', '')) || 0
      const newAngle = currentAngle + 45 // Rotate by 45 degrees
      container.style.transform = `rotate(${newAngle}deg)`
    }, 2000) // Rotate every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.container}></div>
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

export default CircularGraphic
