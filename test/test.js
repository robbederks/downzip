import assert from 'assert'
import Crc32 from '../src/zip/Crc32'
import fs from 'fs'
import path from 'path'

describe('CRC32', () => {
    it('Should compute the correct CRC32 for an empty 1KB file', () => {
        const testCrc = new Crc32()
        testCrc.append(new Uint8Array(1024))
        assert.equal(testCrc.get(), 0xEFB5AF2E)
    })
    it('Should compute the correct CRC32 for an empty 1MB file, split into 1KB chunks', () => {
        const testCrc = new Crc32()
        for(let i=0; i<1024; i++)
            testCrc.append(new Uint8Array(1024))
        assert.equal(testCrc.get(), 0xA738EA1C)
    })
    it('Should compute the correct CRC32 for a random 1MB file', async () => {
        const testCrc = new Crc32()

        const readBuffer = await fs.promises.readFile(path.join(__dirname, 'testFile.bin'))
        testCrc.append(new Uint8Array(readBuffer))
        assert.equal(testCrc.get(), 0x60A35B75)
    })
    it('Should compute the correct CRC32 for a random 1MB file, split into 1KB chunks', async () => {
        const testCrc = new Crc32()

        const readBuffer = await fs.promises.readFile(path.join(__dirname, 'testFile.bin'))
        for(let i=0; i<1024; i++)
            testCrc.append(new Uint8Array(readBuffer.slice(i*1024, (i+1)*1024)))
        assert.equal(testCrc.get(), 0x60A35B75)
    })
})