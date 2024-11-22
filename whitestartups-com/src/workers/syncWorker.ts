import { parentPort } from 'worker_threads'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'
import crypto from 'crypto'

const execPromise = util.promisify(exec)

const uploadDir = '/path/to/upload/dir'
const remoteDir = 'user@remote:/path/to/remote/dir'
const metadataFilePath = path.join(uploadDir, 'metadata.json')

interface FileMetadata {
  name: string
  size: number
  checksum: string
  createTime: string
  uploadTime: string
  status: 'pending' | 'uploaded' | 'synchronized'
}

const readMetadata = (): FileMetadata[] => {
  if (fs.existsSync(metadataFilePath)) {
    const data = fs.readFileSync(metadataFilePath, 'utf-8')
    return JSON.parse(data)
  }
  return []
}

const writeMetadata = (metadata: FileMetadata[]) => {
  fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2))
}

const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath)
}

const calculateChecksum = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath)
  return crypto.createHash('md5').update(fileBuffer).digest('hex')
}

const remoteFileExists = async (fileName: string): Promise<boolean> => {
  try {
    const { stdout } = await execPromise(
      `ssh user@remote 'test -e /path/to/remote/dir/${fileName} && echo "exists"'`,
    )
    return stdout.trim() === 'exists'
  } catch {
    return false
  }
}

const getRemoteChecksum = async (fileName: string): Promise<string> => {
  try {
    const { stdout } = await execPromise(
      `ssh user@remote 'md5sum /path/to/remote/dir/${fileName} | awk "{print $1}"'`,
    )
    return stdout.trim()
  } catch {
    return ''
  }
}

const cleanUpFile = async (fileName: string) => {
  try {
    fs.unlinkSync(path.join(uploadDir, fileName))
    await execPromise(`ssh user@remote 'rm /path/to/remote/dir/${fileName}'`)
  } catch (error) {
    console.error(`Error cleaning up file ${fileName}:`, error)
  }
}

async function syncMetadata() {
  const metadata = readMetadata()
  const updatedMetadata: FileMetadata[] = []

  for (const file of metadata) {
    const localFilePath = path.join(uploadDir, file.name)
    const existsLocally = fileExists(localFilePath)
    const existsRemotely = await remoteFileExists(file.name)

    if (existsLocally || existsRemotely) {
      if (existsLocally && existsRemotely) {
        const localChecksum = calculateChecksum(localFilePath)
        const remoteChecksum = await getRemoteChecksum(file.name)

        if (localChecksum === remoteChecksum) {
          file.status = 'synchronized'
          updatedMetadata.push(file)
        } else {
          await cleanUpFile(file.name)
        }
      } else if (existsRemotely) {
        file.status = 'uploaded'
        updatedMetadata.push(file)
      } else {
        await cleanUpFile(file.name)
      }
    }
  }

  writeMetadata(updatedMetadata)

  if (parentPort) {
    parentPort.postMessage({ status: 'success', message: 'Metadata synchronized' })
  } else {
    console.error('parentPort is null')
  }
}

syncMetadata().catch((error) => {
  console.error('Error synchronizing metadata:', error)
  if (parentPort) {
    parentPort.postMessage({ status: 'error', message: error.message })
  }
})
