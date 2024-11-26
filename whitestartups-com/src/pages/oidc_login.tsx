import { UserManager, WebStorageStateStore, UserManagerSettings } from 'oidc-client-ts'
import { NextApiRequest, NextApiResponse } from 'next/dist/shared/lib/utils'

let userManager: UserManager | undefined

if (typeof window !== 'undefined') {
  const settings: UserManagerSettings = {
    authority: process.env.OIDC_AUTHORITY || 'https://default-authority.com',
    client_id: process.env.OIDC_CLIENT_ID || 'default-client-id',
    redirect_uri: process.env.OIDC_REDIRECT_URI || 'https://default-redirect-uri.com',
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri:
      process.env.OIDC_POST_LOGOUT_REDIRECT_URI || 'https://default-post-logout-redirect-uri.com',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    // Optional settings
    popup_redirect_uri: process.env.OIDC_POPUP_REDIRECT_URI,
    popup_post_logout_redirect_uri: process.env.OIDC_POPUP_POST_LOGOUT_REDIRECT_URI,
    silent_redirect_uri: process.env.OIDC_SILENT_REDIRECT_URI,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: true,
  }

  userManager = new UserManager(settings)
}

export async function initiateOIDCFlow() {
  if (typeof window === 'undefined' || !userManager) {
    throw new Error('UserManager is not initialized')
  }
  try {
    await userManager.signinRedirect()
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false }
  }
}

export default async function oidcLogin(req: NextApiRequest, res: NextApiResponse) {
  if (!userManager) {
    res.status(500).send('UserManager is not initialized')
    return
  }
  try {
    await userManager.signinRedirect()
  } catch (err) {
    console.error(err)
    res.status(500).send('Login error')
  }
}
