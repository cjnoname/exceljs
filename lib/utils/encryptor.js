'use strict';
var crypto = require("crypto");
var Encryptor = {
    /**
     * Calculate a hash of the concatenated buffers with the given algorithm.
     * @param algorithm - The hash algorithm.
     * @returns The hash
     */
    hash: function (algorithm) {
        var buffers = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            buffers[_i - 1] = arguments[_i];
        }
        var hash = crypto.createHash(algorithm);
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
    convertPasswordToHash: function (password, hashAlgorithm, saltValue, spinCount) {
        hashAlgorithm = hashAlgorithm.toLowerCase();
        var hashes = crypto.getHashes();
        if (hashes.indexOf(hashAlgorithm) < 0) {
            throw new Error("Hash algorithm '".concat(hashAlgorithm, "' not supported!"));
        }
        // Password must be in unicode buffer
        var passwordBuffer = Buffer.from(password, 'utf16le');
        // Generate the initial hash
        var key = this.hash(hashAlgorithm, Buffer.from(saltValue, 'base64'), passwordBuffer);
        // Now regenerate until spin count
        for (var i = 0; i < spinCount; i++) {
            var iterator = Buffer.alloc(4);
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
    randomBytes: function (size) {
        return crypto.randomBytes(size);
    },
};
module.exports = Encryptor;
