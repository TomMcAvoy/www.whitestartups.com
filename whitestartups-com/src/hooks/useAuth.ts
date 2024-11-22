import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { authMiddleware } from '@middleware/auth' // Updated import path

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/session')
        setUser(response.data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = () => {
    router.push('/api/auth/login')
  }

  const signOut = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
    router.push('/')
  }

  return { user, loading, signIn, signOut }
}

export default useAuth
