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

export default async function login(req, res) {
  try {
    await userManager.signinRedirect()
  } catch (err) {
    console.error(err)
    res.status(500).send('Login error')
  }
}
