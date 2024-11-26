// src/pages/UploadPage.tsx
import React, { useState, DragEvent } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'
import useAuth from '@hooks/useAuth'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

interface FileMetadata {
  id: string
  userId: string
  uuid: string
  filename: string
  name: string
  size: number
  createTime: string
  uploadTime: string
  status: 'pending' | 'uploaded' | 'synchronized'
  next?: FileMetadata | null
  prev?: FileMetadata | null
}

const UploadPage: React.FC = () => {
  const { user, loading, signIn, signOut } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [metadata, setMetadata] = useState<FileMetadata[]>([])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    console.log('User is not authenticated, redirecting to signin page...')
    return (
      <div>
        <p>You need to be signed in to upload files.</p>
        <button onClick={() => router.push('/signin')}>Sign In</button>
      </div>
    )
  }

  const handleFileUpload = async (file: File) => {
    try {
      const metadataResponse = await axios.post('/api/upload/init', {
        filename: file.name,
        size: file.size,
      })

      const fileMetadata: FileMetadata = metadataResponse.data
      setMetadata((prevMetadata) => [...prevMetadata, fileMetadata])

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append('id', fileMetadata.id)
        formData.append('chunkIndex', chunkIndex.toString())
        formData.append('chunk', chunk)

        await axios.post('/api/upload/chunk', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      await axios.post('/api/upload/complete', { id: fileMetadata.id, filename: file.name })
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles])
    droppedFiles.forEach(handleFileUpload)
  }

  return (
    <div>
      <h1>Upload Page</h1>
      <button onClick={signOut}>Sign Out</button>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        style={{ border: '2px dashed #ccc', padding: '20px', marginTop: '20px' }}
      >
        Drag and drop files here
      </div>
      <ul>
        {files.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default UploadPage
