import { NextApiRequest, NextApiResponse } from 'next'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'

const sessionHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const idToken = req.cookies.id_token
  const jwtSecret = process.env.JWT_SECRET || ('default_secret' as Secret)

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined')
    return res.status(500).json({ error: 'Internal server error' })
  }

  try {
    const decodedIdToken = jwt.verify(idToken, jwtSecret) as JwtPayload & {
      sub: string
    }
    if (!decodedIdToken) {
      throw new Error('Invalid ID token')
    }

    const userId = decodedIdToken.sub

    res.status(200).json({ user: { id: userId } })
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

export default sessionHandler
