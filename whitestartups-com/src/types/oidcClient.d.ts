
// types/oidc-client.d.ts

declare module '@axa-fr/oidc-client' {
  export class UserManager {
    constructor(settings: UserManagerSettings);
    signinRedirect(): Promise<void>;
    signinRedirectCallback(): Promise<User>;
    signoutRedirect(): Promise<void>;
  }

  export class WebStorageStateStore {
    constructor(options: { store: Storage });
  }

  export interface UserManagerSettings {
    authority: string;
    client_id: string;
    redirect_uri: string;
    response_type: string;
    scope: string;
    post_logout_redirect_uri: string;
    userStore: WebStorageStateStore;
  }

  export interface User {
    id_token: string;
    session_state: string;
    access_token: string;
    refresh_token: string;
    token_type: string;
    scope: string;
    profile: {
      sub: string;
      name: string;
      given_name: string;
      family_name: string;
      preferred_username: string;
      email: string;
      email_verified: boolean;
    };
  }
}
