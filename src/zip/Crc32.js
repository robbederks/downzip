// Based on https://github.com/jimmywarting/StreamSaver.js/blob/aaf2301af41ef14371b80d62c2adaf076d5878cb/examples/zip-stream.js

class Crc32 {
    constructor () {
        this.crc = 0
    }

    append = (data) => {
        for (let offset = 0; offset < data.length; offset++)
            this.crc = (this.crc >>> 8) ^ this.table[(this.crc ^ data[offset]) & 0xFF]
    }

    get = () => {
        return (~this.crc)
    }
}

// Setup lookup table (use prototypes to make sure this only runs once)
Crc32.prototype.table = (() => {
    const table = []
    for (let i = 0; i < 256; i++) {
        let t = i
        for (let j = 0; j < 8; j++)
            t = (t & 1) ? ((t >>> 1) ^ 0xEDB88320) : (t >>> 1)  // TODO: Verify that this is the right table!
        table[i] = t
    }
    return table
})()