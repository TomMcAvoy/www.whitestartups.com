var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
const { uploadDir, fileId, totalChunks } = workerData;
const assembleChunks = () => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path.join(uploadDir, fileId);
    const writeStream = fs.createWriteStream(filePath);
    for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = path.join(uploadDir, `${fileId}-${i}`);
        const readStream = fs.createReadStream(chunkFilePath);
        yield new Promise((resolve, reject) => {
            readStream.pipe(writeStream, { end: false });
            readStream.on('end', () => {
                fs.unlinkSync(chunkFilePath); // Remove chunk file after writing
                resolve();
            });
            readStream.on('error', reject);
        });
    }
    writeStream.end();
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            // Calculate checksum using streams
            const hash = crypto.createHash('md5');
            const checksumStream = fs.createReadStream(filePath);
            checksumStream.on('data', (data) => {
                hash.update(data);
            });
            checksumStream.on('end', () => {
                const checksum = hash.digest('hex');
                const fileSize = fs.statSync(filePath).size;
                const createTime = new Date().toISOString();
                const uploadTime = new Date().toISOString();
                const fileMetadata = {
                    name: path.basename(filePath),
                    size: fileSize,
                    checksum,
                    createTime,
                    uploadTime,
                    status: 'pending',
                };
                resolve(fileMetadata);
            });
            checksumStream.on('error', reject);
        });
        writeStream.on('error', reject);
    });
});
const transferFile = (filePath) => {
    return new Promise((resolve, reject) => {
        exec(`rsync -av ${filePath} user@remote:/path/to/remote/dir`, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            }
            else {
                resolve();
            }
        });
    });
};
assembleChunks()
    .then((fileMetadata) => {
    const filePath = path.join(uploadDir, fileId);
    return transferFile(filePath).then(() => {
        fileMetadata.status = 'uploaded';
        return fileMetadata;
    });
})
    .then((fileMetadata) => {
    parentPort.postMessage({ status: 'success', fileMetadata });
})
    .catch((error) => {
    parentPort.postMessage({ status: 'error', error: error.message });
});
//# sourceMappingURL=worker.js.map