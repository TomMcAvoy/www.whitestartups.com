import { Worker } from 'worker_threads'
import path from 'path'

const syncWorker = new Worker(path.join(__dirname, 'syncWorker.js'))

syncWorker.on('message', (message) => {
  if (message.status === 'success') {
    console.log('Metadata synchronized with upload directory and remote directory.')
  } else {
    console.error('Error synchronizing metadata:', message.error)
  }
})

syncWorker.on('error', (error) => {
  console.error('Error in sync worker:', error)
})

syncWorker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Sync worker stopped with exit code ${code}`)
  }
})
