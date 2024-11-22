import { NextApiRequest, NextApiResponse } from 'next'
import jwt, { Secret } from 'jsonwebtoken'

export const authMiddleware = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  const idToken = req.cookies.id_token
  const jwtSecret = process.env.JWT_SECRET as Secret

  if (!idToken) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined')
    res.status(500).json({ message: 'Internal server error' })
    return
  }

  try {
    jwt.verify(idToken, jwtSecret)
    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
