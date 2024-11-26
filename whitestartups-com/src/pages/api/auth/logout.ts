import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

const logoutHandler = (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Logging out user')
  res.setHeader('Set-Cookie', serialize('id_token', '', { path: '/', httpOnly: true, maxAge: -1 }))
  res.status(200).json({ message: 'Logout successful' })
}

export default logoutHandler
