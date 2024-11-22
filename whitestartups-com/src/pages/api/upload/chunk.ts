import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '@middleware/auth'

const uploadChunkHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, chunkIndex, chunk } = req.body

  // Save the chunk to your storage
  // await saveChunk(id, chunkIndex, chunk);

  res.status(200).json({ message: 'Chunk uploaded successfully' })
}

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  authMiddleware(req, res, () => uploadChunkHandler(req, res))

export default handler
