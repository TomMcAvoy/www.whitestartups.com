import { V4 } from "paseto";
import { v4 as uuidv4 } from "uuid";

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("SECRET_KEY environment variable is not defined");
}

export async function generateCsrfToken() {
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }
  const token = await V4.sign({ csrfToken: uuidv4() }, secretKey);
  return token;
}

export async function validateCsrfToken(token: string) {
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }
  try {
    const payload = await V4.verify(token, secretKey);
    return payload.csrfToken;
  } catch (error) {
    console.error("Invalid CSRF token:", error);
    return null;
  }
}
