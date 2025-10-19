"use strict";
// =======================================================================================================
// StreamConverter
//
// convert between encoding schemes in a stream
// Work in Progress - Will complete this at some point
const jconv = undefined; // TODO: jconv is not currently implemented
class StreamConverter {
    constructor(inner, options) {
        this.inner = inner;
        options = options || {};
        this.innerEncoding = (options.innerEncoding || 'UTF8').toUpperCase();
        this.outerEncoding = (options.outerEncoding || 'UTF8').toUpperCase();
        this.innerBOM = options.innerBOM || null;
        this.outerBOM = options.outerBOM || null;
        this.writeStarted = false;
    }
    convertInwards(data) {
        if (data) {
            let buffer;
            if (typeof data === 'string') {
                buffer = Buffer.from(data, this.outerEncoding);
            }
            else {
                buffer = data;
            }
            if (this.innerEncoding !== this.outerEncoding) {
                buffer = jconv.convert(buffer, this.outerEncoding, this.innerEncoding);
            }
            return buffer;
        }
        return undefined;
    }
    convertOutwards(data) {
        let buffer;
        if (typeof data === 'string') {
            buffer = Buffer.from(data, this.innerEncoding);
        }
        else {
            buffer = data;
        }
        if (this.innerEncoding !== this.outerEncoding) {
            buffer = jconv.convert(buffer, this.innerEncoding, this.outerEncoding);
        }
        return buffer;
    }
    addListener(event, handler) {
        this.inner.addListener(event, handler);
    }
    removeListener(event, handler) {
        this.inner.removeListener(event, handler);
    }
    write(data, encoding, callback) {
        if (encoding instanceof Function) {
            callback = encoding;
            encoding = undefined;
        }
        if (!this.writeStarted) {
            // if inner encoding has BOM, write it now
            if (this.innerBOM) {
                this.inner.write(this.innerBOM);
            }
            // if outer encoding has BOM, delete it now
            if (this.outerBOM && Buffer.isBuffer(data)) {
                if (data.length <= this.outerBOM.length) {
                    if (callback) {
                        callback();
                    }
                    return;
                }
                const bomless = Buffer.alloc(data.length - this.outerBOM.length);
                data.copy(bomless, 0, this.outerBOM.length, data.length);
                data = bomless;
            }
            this.writeStarted = true;
        }
        this.inner.write(this.convertInwards(data), encoding ? this.innerEncoding : undefined, callback);
    }
    read() {
        // TBD
    }
    pipe(destination, options) {
        const reverseConverter = new StreamConverter(destination, {
            innerEncoding: this.outerEncoding,
            outerEncoding: this.innerEncoding,
            innerBOM: this.outerBOM,
            outerBOM: this.innerBOM,
        });
        this.inner.pipe(reverseConverter, options);
    }
    close() {
        this.inner.close();
    }
    on(type, callback) {
        switch (type) {
            case 'data':
                this.inner.on('data', (chunk) => {
                    callback(this.convertOutwards(chunk));
                });
                return this;
            default:
                this.inner.on(type, callback);
                return this;
        }
    }
    once(type, callback) {
        this.inner.once(type, callback);
    }
    end(chunk, encoding, callback) {
        this.inner.end(this.convertInwards(chunk), this.innerEncoding, callback);
    }
    emit(type, value) {
        this.inner.emit(type, value);
    }
}
module.exports = StreamConverter;
//# sourceMappingURL=stream-converter.js.map