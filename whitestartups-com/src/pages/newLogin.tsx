import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { initiateOIDCFlow } from './oidc_login'

const Login = () => {
  const router = useRouter()

  useEffect(() => {
    const initiateLogin = async () => {
      const result = await initiateOIDCFlow()
      if (!result.success) {
        router.push('/error') // Redirect to an error page if login fails
      }
    }

    initiateLogin()
  }, [router])

  return <div>Redirecting to login...</div>
}

export default Login
