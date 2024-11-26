import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const meHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const idToken = req.cookies.id_token
  const jwtSecret = process.env.JWT_SECRET as string

  if (!idToken) {
    console.log('ID token is missing')
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    const decodedToken = jwt.verify(idToken, jwtSecret)
    console.log('Decoded token:', decodedToken)
    res.status(200).json(decodedToken)
  } catch (error) {
    console.error('Error verifying token:', error)
    res.status(401).json({ message: 'Unauthorized' })
  }
}

export default meHandler
