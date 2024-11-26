import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me')
        console.log('User info:', response.data)
        setUser(response.data)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = () => {
    if (typeof window !== 'undefined') {
      const googleAuthUrl = `${process.env.GOOGLE_AUTH_URL}?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=/auth/signin&scope=openid%20profile%20email`
      console.log('Redirecting to Google OAuth URL:', googleAuthUrl)
      window.location.href = googleAuthUrl
    }
  }

  const signOut = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
    router.push('/')
  }

  return { user, loading, signIn, signOut }
}

export default useAuth
