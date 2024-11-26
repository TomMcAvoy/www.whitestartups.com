import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

const loginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { code } = req.query

  if (!code) {
    console.log('Authorization code is missing')
    res.status(400).json({ message: 'Authorization code is required' })
    return
  }

  const googleTokenUrl = process.env.GOOGLE_TOKEN_URL as string
  const googleClientId = process.env.GOOGLE_CLIENT_ID as string
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI as string
  const googleUserInfoUrl = process.env.GOOGLE_USER_INFO_URL as string
  const jwtSecret = process.env.JWT_SECRET as string

  if (
    !googleTokenUrl ||
    !googleClientId ||
    !googleClientSecret ||
    !googleUserInfoUrl ||
    !jwtSecret
  ) {
    console.error('Missing environment variables')
    res.status(500).json({ message: 'Internal server error: Missing environment variables' })
    return
  }

  try {
    console.log('Requesting token from Google')
    const tokenResponse = await axios.post(googleTokenUrl, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: googleRedirectUri,
      client_id: googleClientId,
      client_secret: googleClientSecret,
    })

    const { access_token } = tokenResponse.data
    console.log('Received access token:', access_token)

    console.log('Requesting user info from Google')
    const userInfoResponse = await axios.get(googleUserInfoUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const user = userInfoResponse.data
    console.log('Received user info:', user)

    const token = jwt.sign({ sub: user.sub, name: user.name }, jwtSecret, {
      expiresIn: '1h',
    })
    console.log('Generated JWT token:', token)

    res.setHeader('Set-Cookie', serialize('id_token', token, { path: '/', httpOnly: true }))
    res.status(200).json({ message: 'Login successful' })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export default loginHandler
