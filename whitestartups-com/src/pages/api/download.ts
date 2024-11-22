import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const downloadHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const filePath = path.resolve('.', 'path/to/your/file')
  const fileBuffer = fs.readFileSync(filePath)

  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`)
  res.send(fileBuffer)
}

export default downloadHandler
