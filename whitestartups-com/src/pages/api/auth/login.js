var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import clientPromise from '../../../config/oidcClient';
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield clientPromise;
    const authorizationUrl = client.authorizationUrl({
        scope: 'openid email profile',
    });
    res.redirect(authorizationUrl);
});
export default loginHandler;
//# sourceMappingURL=login.js.map