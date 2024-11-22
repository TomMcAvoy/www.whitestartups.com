import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '@middleware/auth'
import fs from 'fs'
import path from 'path'

const completeUploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, filename } = req.body

  const chunkDir = path.join(process.cwd(), 'uploads', id)
  const finalPath = path.join(process.cwd(), 'uploads', filename)

  const chunkFiles = fs.readdirSync(chunkDir)
  chunkFiles.sort((a, b) => parseInt(a) - parseInt(b))

  const writeStream = fs.createWriteStream(finalPath)
  for (const chunkFile of chunkFiles) {
    const chunkPath = path.join(chunkDir, chunkFile)
    const chunkData = fs.readFileSync(chunkPath)
    writeStream.write(chunkData)
    fs.unlinkSync(chunkPath) // Remove chunk file after writing
  }
  writeStream.end()

  fs.rmdirSync(chunkDir) // Remove chunk directory

  // Update metadata in your database
  // await updateMetadata(id, { status: 'uploaded', uploadTime: new Date().toISOString() });

  res.status(200).json({ message: 'Upload completed successfully' })
}

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  authMiddleware(req, res, () => completeUploadHandler(req, res))

export default handler
