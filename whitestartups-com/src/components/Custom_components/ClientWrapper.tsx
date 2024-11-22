'use client' // Ensure this directive is correctly formatted

import React from 'react'
import dynamic from 'next/dynamic'

const ClientGraphics = dynamic(() => import('../Custom_components/ClientGraphics'), {
  ssr: false, // Disable server-side rendering
})

interface ClientWrapperProps {
  initialStars: number
  initialShootingStars: number
  children: React.ReactNode
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({
  initialStars,
  initialShootingStars,
  children,
}) => {
  return (
    <>
      {children}
      <ClientGraphics initialStars={initialStars} initialShootingStars={initialShootingStars} />
    </>
  )
}

export default ClientWrapper
