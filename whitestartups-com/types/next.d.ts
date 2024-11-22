import { NextApiRequest } from 'next'
import { JwtPayload } from 'jsonwebtoken'

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: JwtPayload & { id: string }
}
