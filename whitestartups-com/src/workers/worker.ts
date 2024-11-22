import { parentPort, workerData } from 'worker_threads'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { exec } from 'child_process'

const { uploadDir, fileId, totalChunks } = workerData

interface FileMetadata {
  name: string
  size: number
  checksum: string
  createTime: string
  uploadTime: string
  status: 'pending' | 'uploaded'
}

const assembleChunks = async (): Promise<FileMetadata> => {
  const filePath = path.join(uploadDir, fileId)
  const writeStream = fs.createWriteStream(filePath)

  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = path.join(uploadDir, `${fileId}-${i}`)
    const readStream = fs.createReadStream(chunkFilePath)
    readStream.pipe(writeStream, { end: false })
    await new Promise((resolve) => readStream.on('end', resolve))
    fs.unlinkSync(chunkFilePath) // Remove chunk file after writing
  }
  writeStream.end()

  const fileMetadata: FileMetadata = {
    name: fileId,
    size: fs.statSync(filePath).size,
    checksum: crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex'),
    createTime: new Date().toISOString(),
    uploadTime: new Date().toISOString(),
    status: 'uploaded',
  }

  return fileMetadata
}

assembleChunks()
  .then((fileMetadata: FileMetadata) => {
    if (parentPort) {
      parentPort.postMessage({ status: 'success', fileMetadata })
    } else {
      console.error('parentPort is null')
    }
  })
  .catch((error) => {
    if (parentPort) {
      parentPort.postMessage({ status: 'error', error: error.message })
    } else {
      console.error('parentPort is null')
    }
  })
