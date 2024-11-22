import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '@middleware/auth'

const initUploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { filename, size } = req.body
  const userId = (req as any).user.sub

  const metadata = {
    id: uuidv4(),
    userId,
    uuid: uuidv4(),
    filename,
    name: filename,
    size,
    createTime: new Date().toISOString(),
    uploadTime: '',
    status: 'pending',
  }

  // Save metadata to your database
  // await saveMetadata(metadata);

  res.status(200).json(metadata)
}

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  authMiddleware(req, res, () => initUploadHandler(req, res))

export default handler
