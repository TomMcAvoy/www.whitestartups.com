import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const uploadDir = '/var/tmp/uploads'

interface FileMetadata {
  id: string
  userId: string
  name: string
  size: number
  createTime: string
  uploadTime: string
  status: 'pending' | 'uploaded' | 'synchronized'
}

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

const initializeMetadataHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const metadataPath = path.resolve('.', 'path/to/your/metadata/file')
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))

  res.status(200).json(metadata)
}

export default initializeMetadataHandler
