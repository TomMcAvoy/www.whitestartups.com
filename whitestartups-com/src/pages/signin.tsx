import { useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const SignIn = () => {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOIDCFlow = async () => {
        const { initiateOIDCFlow } = await import('./oidc_login')
        try {
          const oidcResponse = await initiateOIDCFlow()
          if (oidcResponse.success) {
            router.push('/admin')
          } else {
            router.push('/payload/login')
          }
        } catch (error) {
          console.error('OIDC flow error:', error)
          router.push('/payload/login')
        }
      }

      handleOIDCFlow()
    }
  }, [router])

  return (
    <div>
      <h1>Signing In...</h1>
      {/* You can add a loading spinner or message here */}
    </div>
  )
}

export default dynamic(() => Promise.resolve(SignIn), { ssr: false })
