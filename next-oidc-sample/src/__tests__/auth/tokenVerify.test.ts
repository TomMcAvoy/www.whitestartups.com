/* eslint-disable @typescript-eslint/no-unused-vars */
import { TokenVerifier } from "../../lib/tokens/verify";
import { mockTokenResponse, mockUserInfo } from "../mocks/googleOidcConfig";

describe("TokenVerifier", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyToken", () => {
    it("should verify a valid token", async () => {
      const mockJwt = "valid.mock.token";

      const result = await TokenVerifier.verifyToken(mockJwt, {
        issuer: "https://accounts.google.com",
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      expect(result).toBeTruthy();
    });

    it("should reject an invalid token", async () => {
      const mockJwt = "invalid.token";

      await expect(TokenVerifier.verifyToken(mockJwt)).rejects.toThrow(
        "Token verification failed"
      );
    });
  });
});
