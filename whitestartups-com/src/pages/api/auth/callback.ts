import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { IdTokenPayload } from '@localtypes/oidc'
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

const getEnvVar = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not defined`)
  }
  return value
}

const settings = {
  authority: getEnvVar('OIDC_AUTHORITY'),
  client_id: getEnvVar('OIDC_CLIENT_ID'),
  redirect_uri: getEnvVar('OIDC_REDIRECT_URI'),
  response_type: 'code',
  scope: 'openid profile email',
  post_logout_redirect_uri: getEnvVar('OIDC_POST_LOGOUT_REDIRECT_URI'),
  userStore: new WebStorageStateStore({ store: global.localStorage }), // Corrected for Node.js environment
}

const userManager = new UserManager(settings)

const callbackHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await userManager.signinRedirectCallback()
    res.redirect('/signin')
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
