export const generateCodeVerifier = () => {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
    ""
  );
};

export const generateCodeChallenge = async (codeVerifier: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const fetchOpenIdConfiguration = async () => {
  const authUrl = process.env.GOOGLE_AUTH_URL;
  if (!authUrl) {
    throw new Error("GOOGLE_AUTH_URL environment variable is not defined");
  }

  const response = await fetch(authUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch OpenID configuration");
  }
  return response.json();
};
