export type TokenPayload = {
  sub: string;
  email?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
};

export type VerifyOptions = {
  issuer?: string;
  audience?: string;
  maxAge?: number;
  type?: "jwt" | "paseto";
};
