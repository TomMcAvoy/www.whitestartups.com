/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SessionStore } from "@/lib/redis/store";
import { OIDCClient } from "@/lib/oidc/client";

export default function LoginPage() {
  const [session, setSession] = useState(null);
  const [codeChallenge, setCodeChallenge] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      const sessionId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sessionId="))
        ?.split("=")[1];

      if (sessionId) {
        const session = await SessionStore.getSession(sessionId);
        setSession({ ...session, sessionId });
        if (session) {
          setCodeChallenge(session.code_challenge);
          setCodeVerifier(session.code_verifier);
        }
      }
    }
    fetchSession();
  }, []);

  const handleLogin = async () => {
    try {
      const { authUrl } = await OIDCClient.startAuthProcess();
      router.push(authUrl);
    } catch (error) {
      console.error("Failed to start authentication process:", error);
    }
  };

  const handleLogout = async () => {
    const sessionId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sessionId="))
      ?.split("=")[1];

    if (sessionId) {
      await SessionStore.delete(sessionId);
      setSession(null);
      setCodeChallenge("");
      setCodeVerifier("");
    }
  };

  const handleButtonClick = () => {
    if (session) {
      handleLogout();
    } else {
      handleLogin();
    }
  };

  return (
    <div>
      <h1>OIDC Test Login Page</h1>
      <p>
        Welcome to the OIDC Test Login Page. This page demonstrates the OpenID
        Connect (OIDC) authentication flow using our existing code base. Below
        is an explanation of how this page works, including the components and
        flows involved.
      </p>
      <h2>Components and Flows</h2>
      <p>This page consists of the following key components and flows:</p>
      <ul>
        <li>
          <strong>Session Management:</strong> The session management is handled
          using the `SessionStore` from our Redis store. The session ID is
          retrieved from the cookies, and the session details are fetched from
          the Redis store.
        </li>
        <li>
          <strong>Login Flow:</strong> When the login button is clicked, the
          `handleLogin` function is triggered. This function initiates the OIDC
          authentication process by calling the `startAuthProcess` function,
          which returns the authentication URL. The user is then redirected to
          this URL to complete the authentication.
        </li>
        <li>
          <strong>Logout Flow:</strong> When the logout button is clicked, the
          `handleLogout` function is triggered. This function clears the session
          from the Redis store and updates the state to reflect that the user is
          logged out.
        </li>
        <li>
          <strong>Code Challenge and Code Verifier:</strong> Once the user is
          logged in, the code challenge and code verifier are displayed. These
          values are part of the PKCE (Proof Key for Code Exchange) flow used in
          OIDC to enhance security.
        </li>
      </ul>
      <h2>Code Challenge and Code Verifier in Request Context</h2>
      <p>
        In the context of an OIDC (OpenID Connect) authentication flow, the code
        challenge and code verifier are part of the PKCE (Proof Key for Code
        Exchange) mechanism. These values are typically generated on the client
        side and need to be stored in a way that they can be accessed during the
        authentication process.
      </p>
      <p>
        JavaScript Symbols can be used to store these values in the request
        context in a way that avoids naming collisions. Symbols are unique and
        immutable, making them ideal for storing sensitive data like the code
        challenge and code verifier.
      </p>
      <p>
        Here's an example of how you can use JavaScript Symbols to store and
        retrieve the code challenge and code verifier in the request context:
      </p>
      <pre>
        <code>
          {`
const CODE_CHALLENGE_SYMBOL = Symbol('code_challenge');
const CODE_VERIFIER_SYMBOL = Symbol('code_verifier');

export function setCodeChallenge(req: any, codeChallenge: string) {
  req[CODE_CHALLENGE_SYMBOL] = codeChallenge;
}

export function getCodeChallenge(req: any): string | undefined {
  return req[CODE_CHALLENGE_SYMBOL];
}

export function setCodeVerifier(req: any, codeVerifier: string) {
  req[CODE_VERIFIER_SYMBOL] = codeVerifier;
}

export function getCodeVerifier(req: any): string | undefined {
  return req[CODE_VERIFIER_SYMBOL];
}
          `}
        </code>
      </pre>
      <h2>Current Session</h2>
      {session ? (
        <div>
          <p>Logged in as: {session.user.name}</p>
          <p>Code Challenge: {codeChallenge}</p>
          <p>Code Verifier: {codeVerifier}</p>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
      <button onClick={handleButtonClick}>
        {session ? "Logout" : "Login"}
      </button>
    </div>
  );
}
