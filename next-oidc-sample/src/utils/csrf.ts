import { V4 } from "paseto";
import { v4 as uuidv4 } from "uuid";

const secretKey = process.env.PASETO_SECRET_KEY;

if (!secretKey) {
  throw new Error("PASETO_SECRET_KEY is not defined");
}

export async function generateCsrfToken() {
  const token = await V4.sign({ csrfToken: uuidv4() }, secretKey);
  return token;
}

export async function validateCsrfToken(token: string) {
  try {
    const payload = await V4.verify(token, secretKey);
    return payload.csrfToken;
  } catch (error) {
    console.error("Invalid CSRF token:", error);
    return null;
  }
}
