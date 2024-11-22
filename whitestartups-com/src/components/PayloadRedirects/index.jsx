var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCachedDocument } from '@/utilities/getDocument';
import { getCachedRedirects } from '@/utilities/getRedirects';
import { notFound, redirect } from 'next/navigation';
/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects = (_a) => __awaiter(void 0, [_a], void 0, function* ({ disableNotFound, url }) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const slug = url.startsWith('/') ? url : `${url}`;
    const redirects = yield getCachedRedirects()();
    const redirectItem = redirects.find((redirect) => redirect.from === slug);
    if (redirectItem) {
        if ((_b = redirectItem.to) === null || _b === void 0 ? void 0 : _b.url) {
            redirect(redirectItem.to.url);
        }
        let redirectUrl;
        if (typeof ((_d = (_c = redirectItem.to) === null || _c === void 0 ? void 0 : _c.reference) === null || _d === void 0 ? void 0 : _d.value) === 'string') {
            const collection = (_f = (_e = redirectItem.to) === null || _e === void 0 ? void 0 : _e.reference) === null || _f === void 0 ? void 0 : _f.relationTo;
            const id = (_h = (_g = redirectItem.to) === null || _g === void 0 ? void 0 : _g.reference) === null || _h === void 0 ? void 0 : _h.value;
            const document = (yield getCachedDocument(collection, id)());
            redirectUrl = `${((_k = (_j = redirectItem.to) === null || _j === void 0 ? void 0 : _j.reference) === null || _k === void 0 ? void 0 : _k.relationTo) !== 'pages' ? `/${(_m = (_l = redirectItem.to) === null || _l === void 0 ? void 0 : _l.reference) === null || _m === void 0 ? void 0 : _m.relationTo}` : ''}/${document === null || document === void 0 ? void 0 : document.slug}`;
        }
        else {
            redirectUrl = `${((_p = (_o = redirectItem.to) === null || _o === void 0 ? void 0 : _o.reference) === null || _p === void 0 ? void 0 : _p.relationTo) !== 'pages' ? `/${(_r = (_q = redirectItem.to) === null || _q === void 0 ? void 0 : _q.reference) === null || _r === void 0 ? void 0 : _r.relationTo}` : ''}/${typeof ((_t = (_s = redirectItem.to) === null || _s === void 0 ? void 0 : _s.reference) === null || _t === void 0 ? void 0 : _t.value) === 'object'
                ? (_w = (_v = (_u = redirectItem.to) === null || _u === void 0 ? void 0 : _u.reference) === null || _v === void 0 ? void 0 : _v.value) === null || _w === void 0 ? void 0 : _w.slug
                : ''}`;
        }
        if (redirectUrl)
            redirect(redirectUrl);
    }
    if (disableNotFound)
        return null;
    notFound();
});
//# sourceMappingURL=index.jsx.map