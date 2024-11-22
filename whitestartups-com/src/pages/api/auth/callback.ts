import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { IdTokenPayload } from '../../../types/oidc'
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

const settings = {
  authority: 'https://your-oidc-provider.com',
  client_id: 'your-client-id',
  redirect_uri: 'http://localhost:4000/callback',
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: 'http://localhost:4000/',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

const userManager = new UserManager(settings)

const callbackHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await userManager.signinRedirectCallback()
    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.status(500).send('Authentication error')
  }
}

const isIdTokenPayload = (payload: any): payload is IdTokenPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.name === 'string' &&
    typeof payload.picture === 'string'
  )
}

export default callbackHandler
