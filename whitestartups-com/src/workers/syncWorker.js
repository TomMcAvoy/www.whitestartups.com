var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parentPort } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
const execPromise = util.promisify(exec);
const uploadDir = '/path/to/upload/dir';
const remoteDir = 'user@remote:/path/to/remote/dir';
const metadataFilePath = path.join(uploadDir, 'metadata.json');
const readMetadata = () => {
    if (fs.existsSync(metadataFilePath)) {
        const data = fs.readFileSync(metadataFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};
const writeMetadata = (metadata) => {
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
};
const fileExists = (filePath) => {
    return fs.existsSync(filePath);
};
const calculateChecksum = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
};
const remoteFileExists = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stdout } = yield execPromise(`ssh user@remote 'test -e /path/to/remote/dir/${fileName} && echo "exists"'`);
        return stdout.trim() === 'exists';
    }
    catch (_a) {
        return false;
    }
});
const getRemoteChecksum = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stdout } = yield execPromise(`ssh user@remote 'md5sum /path/to/remote/dir/${fileName} | awk "{print $1}"'`);
        return stdout.trim();
    }
    catch (_a) {
        return '';
    }
});
const cleanUpFile = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        fs.unlinkSync(path.join(uploadDir, fileName));
        yield execPromise(`ssh user@remote 'rm /path/to/remote/dir/${fileName}'`);
    }
    catch (error) {
        console.error(`Error cleaning up file ${fileName}:`, error);
    }
});
const syncMetadata = () => __awaiter(void 0, void 0, void 0, function* () {
    const metadata = readMetadata();
    const updatedMetadata = [];
    for (const file of metadata) {
        const localFilePath = path.join(uploadDir, file.name);
        const existsLocally = fileExists(localFilePath);
        const existsRemotely = yield remoteFileExists(file.name);
        if (existsLocally || existsRemotely) {
            if (existsLocally && existsRemotely) {
                const localChecksum = calculateChecksum(localFilePath);
                const remoteChecksum = yield getRemoteChecksum(file.name);
                if (localChecksum === remoteChecksum) {
                    file.status = 'synchronized';
                    updatedMetadata.push(file);
                }
                else {
                    yield cleanUpFile(file.name);
                }
            }
            else if (existsRemotely) {
                file.status = 'uploaded';
                updatedMetadata.push(file);
            }
            else {
                yield cleanUpFile(file.name);
            }
        }
    }
    writeMetadata(updatedMetadata);
    parentPort.postMessage({ status: 'success', message: 'Metadata synchronized' });
});
syncMetadata().catch((error) => {
    parentPort.postMessage({ status: 'error', error: error.message });
});
//# sourceMappingURL=syncWorker.js.map