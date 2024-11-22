import { NextApiRequest, NextApiResponse } from 'next'
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'
import jwt from 'jsonwebtoken'

const settings = {
  authority: 'https://your-oidc-provider.com',
  client_id: 'your-client-id',
  redirect_uri: 'http://localhost:4000/callback',
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: 'http://localhost:4000/',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

const userManager = new UserManager(settings)

export default async function refresh(req: NextApiRequest, res: NextApiResponse) {
  const refreshToken = req.cookies.refresh_token

  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Assuming you have a method to refresh the token using the refresh token
    const user = await userManager.signinRedirectCallback()

    const { id_token, access_token, refresh_token } = user

    // Decode the access token to get the expiration time
    const decodedAccessToken = jwt.decode(access_token) as { exp: number }
    const expires_in = decodedAccessToken.exp - Math.floor(Date.now() / 1000)

    // Calculate the expiration time in seconds
    const maxAge = expires_in ? expires_in : 3600 // Default to 1 hour if expires_in is not available

    // Set the new tokens as secure, HTTP-only cookies
    res.setHeader('Set-Cookie', [
      `id_token=${id_token}; HttpOnly; Secure; Path=/; Max-Age=${maxAge}`,
      `access_token=${access_token}; HttpOnly; Secure; Path=/; Max-Age=${maxAge}`,
      `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/; Max-Age=${maxAge}`,
    ])

    res.status(200).json({ message: 'Tokens refreshed successfully' })
  } catch (error) {
    console.error(error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
