// src/pages/_app.tsx
import { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import '@styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('/api/auth/session')
      } catch (error) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return <Component {...pageProps} />
}

export default MyApp
