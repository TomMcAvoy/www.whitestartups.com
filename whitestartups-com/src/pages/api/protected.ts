import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '@middleware/auth' // Ensure this import path is correct

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  authMiddleware(req, res, () => {
    // Upload functionality goes here
  })
}

export default handler
