import { Duplex } from 'readable-stream';
// =============================================================================
// StreamBase64 - A utility to convert to/from base64 stream
// Note: does not buffer data, must be piped
class StreamBase64 extends Duplex {
    constructor() {
        super();
        // consuming pipe streams go here
        this.pipes = [];
    }
    // writable
    // event drain - if write returns false (which it won't), indicates when safe to write again.
    // finish - end() has been called
    // pipe(src) - pipe() has been called on readable
    // unpipe(src) - unpipe() has been called on readable
    // error - duh
    write(..._args) {
        return true;
    }
    cork() { }
    uncork() { }
    end(..._args) {
        return this;
    }
    // readable
    // event readable - some data is now available
    // event data - switch to flowing mode - feeds chunks to handler
    // event end - no more data
    // event close - optional, indicates upstream close
    // event error - duh
    read(_size) { }
    setEncoding(encoding) {
        // causes stream.read or stream.on('data) to return strings of encoding instead of Buffer objects
        this.encoding = encoding;
        return this;
    }
    pause() {
        return this;
    }
    resume() {
        return this;
    }
    isPaused() {
        return false;
    }
    pipe(destination, _options) {
        // add destination to pipe list & write current buffer
        this.pipes.push(destination);
        return destination;
    }
    unpipe(destination) {
        // remove destination from pipe list
        this.pipes = this.pipes.filter(pipe => pipe !== destination);
        return this;
    }
    unshift(_chunk) {
        // some numpty has read some data that's not for them and they want to put it back!
        // Might implement this some day
        throw new Error('Not Implemented');
    }
    wrap(_stream) {
        // not implemented
        throw new Error('Not Implemented');
    }
}
export default StreamBase64;
//# sourceMappingURL=stream-base64.js.map