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
import { promisify } from 'util';
const uploadDir = '/var/tmp/uploads';
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const initializeMetadata = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('initializeMetadata called');
    if (req.method === 'GET') {
        console.log('GET request received');
        try {
            console.log(`Reading directory: ${uploadDir}`);
            const files = yield readdir(uploadDir);
            console.log(`Files found: ${files}`);
            if (files.length === 0) {
                console.log('No files found in the directory');
                res.status(200).json([]);
                return;
            }
            const metadata = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(`Processing file: ${file}`);
                const filePath = path.join(uploadDir, file);
                console.log(`File path: ${filePath}`);
                const stats = yield stat(filePath);
                console.log(`File stats: ${JSON.stringify(stats)}`);
                return {
                    id: file,
                    userId: 'exampleUserId', // Replace with actual user ID
                    name: file,
                    size: stats.size,
                    createTime: stats.birthtime.toISOString(),
                    uploadTime: new Date().toISOString(),
                    status: 'uploaded',
                };
            })));
            console.log('Metadata generated:', metadata);
            res.status(200).json(metadata);
        }
        catch (error) {
            console.error('Error initializing metadata:', error);
            res.status(500).json({ error: 'Failed to initialize metadata' });
        }
    }
    else {
        console.log('Invalid request method');
        res.status(405).json({ error: 'Method not allowed' });
    }
});
export default initializeMetadata;
//# sourceMappingURL=initializeMetadata.js.map