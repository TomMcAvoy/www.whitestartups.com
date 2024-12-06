import jwt from "jsonwebtoken";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { V4 } from "@paseto/sdk";
import type { TokenPayload, VerifyOptions } from "./types";

export class TokenVerifier {
  private static readonly JWKS_URI = `${process.env.OIDC_AUTHORITY}/.well-known/jwks.json`;
  private static readonly JWKS = createRemoteJWKSet(
    new URL(TokenVerifier.JWKS_URI)
  );
  private static readonly PASETO_PUBLIC_KEY = process.env.PASETO_PUBLIC_KEY!;
  private publicKey: string;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  static async verifyToken(
    token: string,
    options: VerifyOptions = {}
  ): Promise<TokenPayload> {
    // Detect token type if not specified
    const tokenType = options.type || this.detectTokenType(token);

    try {
      switch (tokenType) {
        case "jwt":
          return await this.verifyJWT(token, options);
        case "paseto":
          return await this.verifyPASETO(token, options);
        default:
          throw new Error("Unsupported token format");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Error("Token verification failed");
    }
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.publicKey);
      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  private static detectTokenType(token: string): "jwt" | "paseto" {
    // PASETO always starts with 'v4.public.' or 'v4.local.'
    if (token.startsWith("v4.")) {
      return "paseto";
    }
    // JWT typically has three dot-separated segments
    if (token.split(".").length === 3) {
      return "jwt";
    }
    throw new Error("Unknown token format");
  }

  private static async verifyJWT(
    token: string,
    options: VerifyOptions
  ): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.JWKS, {
      issuer: options.issuer,
      audience: options.audience,
      maxTokenAge: options.maxAge,
    });

    // Verify required claims
    if (!payload.sub) {
      throw new Error("Missing subject claim");
    }

    // Check expiration if not handled by jwtVerify
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("Token expired");
    }

    return payload as TokenPayload;
  }

  private static async verifyPASETO(
    token: string,
    options: VerifyOptions
  ): Promise<TokenPayload> {
    const parser = new V4();

    const payload = await parser.verify({
      payload: token,
      publicKey: this.PASETO_PUBLIC_KEY,
      assertion: options.audience, // Optional audience check
    });

    // Parse payload
    const claims = JSON.parse(payload);

    // Verify required claims
    if (!claims.sub) {
      throw new Error("Missing subject claim");
    }

    // Check issuer
    if (options.issuer && claims.iss !== options.issuer) {
      throw new Error("Invalid issuer");
    }

    // Check expiration
    if (claims.exp && Date.now() >= claims.exp * 1000) {
      throw new Error("Token expired");
    }

    // Check max age if specified
    if (options.maxAge && claims.iat) {
      const maxTime = claims.iat * 1000 + options.maxAge;
      if (Date.now() >= maxTime) {
        throw new Error("Token exceeded maximum age");
      }
    }

    return claims as TokenPayload;
  }
}
