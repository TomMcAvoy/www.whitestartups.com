import { NextApiRequest, NextApiResponse } from 'next'
import jwt, { Secret } from 'jsonwebtoken'
import { authMiddleware } from '@middleware/auth' // Ensure this import path is correct
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.resolve('.', 'uploads')
const METADATA_DIR = path.resolve('.', 'metadata')
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

if (!fs.existsSync(METADATA_DIR)) {
  fs.mkdirSync(METADATA_DIR, { recursive: true })
}

type FileMetadata = {
  id: string
  userId: string
  uuid: string
  filename: string
  name: string
  size: number
  createTime: string
  uploadTime: string
  status: string
}

const initializeMetadata = (
  uuid: string,
  userId: string,
  filename: string,
  size: number,
): FileMetadata => {
  const metadata: FileMetadata = {
    id: uuid,
    userId: userId,
    uuid: uuid,
    filename: filename,
    name: filename,
    size: size,
    createTime: new Date().toISOString(),
    uploadTime: '',
    status: 'pending',
  }
  const metadataPath = path.join(METADATA_DIR, `${uuid}-${filename}.json`)
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  return metadata
}

const synchronizeMetadata = (uuid: string, filename: string, updates: Partial<FileMetadata>) => {
  const metadataPath = path.join(METADATA_DIR, `${uuid}-${filename}.json`)
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as FileMetadata
  const updatedMetadata = { ...metadata, ...updates }
  fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2))
  return updatedMetadata
}

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const idToken = req.cookies.id_token
  const jwtSecret = process.env.JWT_SECRET as Secret

  if (!idToken) {
    console.log('Unauthorized access attempt')
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined')
    res.status(500).json({ message: 'Internal server error' })
    return
  }

  try {
    const decodedIdToken = jwt.verify(idToken, jwtSecret) as jwt.JwtPayload & {
      sub: string
    }
    if (!decodedIdToken) {
      throw new Error('Invalid ID token')
    }

    const userId = decodedIdToken.sub
    const uuid = uuidv4() // Generate a unique identifier for the file

    // Proceed with the upload logic using userId and uuid
    if (req.method === 'POST') {
      const { filename, chunkIndex, totalChunks, size, chunk } = req.body

      const filePath = path.join(UPLOAD_DIR, `${uuid}-${filename}`)
      const chunkPath = `${filePath}.part${chunkIndex}`

      // Initialize metadata if this is the first chunk
      if (chunkIndex === 0) {
        initializeMetadata(uuid, userId, filename, size)
      }

      // Save the chunk to the file system
      fs.writeFileSync(chunkPath, Buffer.from(chunk, 'base64'))

      // Synchronize metadata after each chunk upload
      synchronizeMetadata(uuid, filename, {
        status: 'pending',
        uploadTime: new Date().toISOString(),
      })

      // Check if all chunks are uploaded
      const uploadedChunks = fs
        .readdirSync(UPLOAD_DIR)
        .filter((file) => file.startsWith(`${uuid}-${filename}.part`))
      if (uploadedChunks.length === totalChunks) {
        // Combine chunks into the final file
        const writeStream = fs.createWriteStream(filePath)
        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = `${filePath}.part${i}`
          const data = fs.readFileSync(chunkPath)
          writeStream.write(data)
          fs.unlinkSync(chunkPath) // Remove the chunk file after writing
        }
        writeStream.end()

        // Update metadata to reflect completion
        const metadata = synchronizeMetadata(uuid, filename, {
          status: 'uploaded',
          uploadTime: new Date().toISOString(),
        })

        res.status(200).json({ message: 'Upload complete', metadata })
      } else {
        res.status(200).json({ message: 'Chunk uploaded successfully' })
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.log('Unauthorized access attempt', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  authMiddleware(req, res, () => uploadHandler(req, res))

export default handler
