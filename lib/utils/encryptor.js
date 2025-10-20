'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const Encryptor = {
    /**
     * Calculate a hash of the concatenated buffers with the given algorithm.
     * @param algorithm - The hash algorithm.
     * @returns The hash
     */
    hash(algorithm, ...buffers) {
        const hash = crypto.createHash(algorithm);
        hash.update(Buffer.concat(buffers));
        return hash.digest();
    },
    /**
     * Convert a password into an encryption key
     * @param password - The password
     * @param hashAlgorithm - The hash algoritm
     * @param saltValue - The salt value
     * @param spinCount - The spin count
     * @returns The encryption key
     */
    convertPasswordToHash(password, hashAlgorithm, saltValue, spinCount) {
        hashAlgorithm = hashAlgorithm.toLowerCase();
        const hashes = crypto.getHashes();
        if (hashes.indexOf(hashAlgorithm) < 0) {
            throw new Error(`Hash algorithm '${hashAlgorithm}' not supported!`);
        }
        // Password must be in unicode buffer
        const passwordBuffer = Buffer.from(password, 'utf16le');
        // Generate the initial hash
        let key = this.hash(hashAlgorithm, Buffer.from(saltValue, 'base64'), passwordBuffer);
        // Now regenerate until spin count
        for (let i = 0; i < spinCount; i++) {
            const iterator = Buffer.alloc(4);
            // this is the 'special' element of Excel password hashing
            // that stops us from using crypto.pbkdf2()
            iterator.writeUInt32LE(i, 0);
            key = this.hash(hashAlgorithm, key, iterator);
        }
        return key.toString('base64');
    },
    /**
     * Generates cryptographically strong pseudo-random data.
     * @param size The size argument is a number indicating the number of bytes to generate.
     */
    randomBytes(size) {
        return crypto.randomBytes(size);
    },
};
exports.default = Encryptor;
//# sourceMappingURL=encryptor.js.map