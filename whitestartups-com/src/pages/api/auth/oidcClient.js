var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Issuer } from 'openid-client';
function createClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const oidcIssuer = yield Issuer.discover('https://accounts.google.com'); // Replace with your OIDC provider
        const oidcClient = new oidcIssuer.Client({
            client_id: process.env.OIDC_CLIENT_ID,
            client_secret: process.env.OIDC_CLIENT_SECRET,
            redirect_uris: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`],
            response_types: ['code'],
        });
        return oidcClient;
    });
}
const clientPromise = createClient();
export default clientPromise;
//# sourceMappingURL=oidcClient.js.map