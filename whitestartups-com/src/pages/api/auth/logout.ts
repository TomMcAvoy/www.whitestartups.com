import { NextApiRequest, NextApiResponse } from 'next'

const logoutHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Set-Cookie', [
    `id_token=; HttpOnly; Path=/; Max-Age=0`,
    `access_token=; HttpOnly; Path=/; Max-Age=0`,
  ])
  res.status(200).json({ message: 'Logged out' })
}

export default logoutHandler
