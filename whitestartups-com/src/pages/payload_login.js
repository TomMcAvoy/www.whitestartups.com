import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

const PayloadLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token } = response.data
      document.cookie = `payload_token=${token}; path=/`
      router.push('/')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default PayloadLoginPage
