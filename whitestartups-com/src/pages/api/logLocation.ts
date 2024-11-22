import { NextApiRequest, NextApiResponse } from 'next'
import ipinfo from 'ipinfo'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (!ip) {
    res.status(400).json({ error: 'Unable to determine IP address' })
    return
  }

  try {
    const location = await ipinfo(ip as string)
    console.log('Visitor Location:', location)

    // Here you can save the location data to your database if needed

    res.status(200).json({ message: 'Location logged', location })
  } catch (error) {
    console.error('Error fetching location:', error)
    res.status(500).json({ error: 'Error fetching location' })
  }
}

export default handler
