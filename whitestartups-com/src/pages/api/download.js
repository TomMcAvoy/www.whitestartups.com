var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import path from 'path';
const uploadDir = '/var/tmp/uploads';
const handler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.method === 'GET') {
        const { fileId } = req.query;
        if (typeof fileId !== 'string') {
            res.status(400).json({ error: 'Invalid file ID' });
            return;
        }
        const decodedFileId = decodeURIComponent(fileId);
        const filePath = path.join(uploadDir, decodedFileId);
        if (fs.existsSync(filePath)) {
            const encodedFileName = encodeURIComponent(decodedFileId);
            res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
        else {
            res.status(404).json({ error: 'File not found' });
        }
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
});
export default handler;
//# sourceMappingURL=download.js.map