import assert from 'assert'
import Crc32 from '../src/zip/Crc32'
import ZipUtils from '../src/zip/ZipUtils'
import Zip from '../src/zip/Zip'
import fs from 'fs'
import path from 'path'
import jszip from 'jszip'
import crypto from 'crypto'

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

describe('ZipUtils', () => {
    context('createByteArray', () => {
        it('Should create a ByteArray for chars', () => {
            const result = ZipUtils.createByteArray([{data: 0x12, size: 1}, {data: 0x34, size: 1}])
            assert.deepEqual(result, new Uint8Array([0x12, 0x34]))
        })
        it('Should create a ByteArray for words', () => {
            const result = ZipUtils.createByteArray([{data: 0x1234, size: 2}, {data: 0x5678, size: 2}])
            assert.deepEqual(result, new Uint8Array([0x34, 0x12, 0x78, 0x56]))
        })
        it('Should create a ByteArray for ints', () => {
            const result = ZipUtils.createByteArray([{data: 0x12345678, size: 4}, {data: 0x87654321, size: 4}])
            assert.deepEqual(result, new Uint8Array([0x78, 0x56, 0x34, 0x12, 0x21, 0x43, 0x65, 0x87]))
        })
        it('Should create a ByteArray for longs', () => {
            const result = ZipUtils.createByteArray([{data: BigInt("0x123456789ABCDEF0"), size: 8}])
            assert.deepEqual(result, new Uint8Array([0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12]))
        })
        it('Should create a ByteArray for buffers', () => {
            const result = ZipUtils.createByteArray([{data: new TextEncoder().encode("Test1234")}])
            assert.deepEqual(result, new Uint8Array([84, 101, 115, 116, 49, 50, 51, 52]))
        })
        it('Should throw an error for a non-defined length', () => {
            assert.throws(() => ZipUtils.createByteArray([{data: 0x123, size: 3}]))
        })
        it('Should create a ByteArray for combined data', () => {
            const result = ZipUtils.createByteArray([
                    {data: 0x12, size: 1},
                    {data: 0x34, size: 1},
                    {data: 0x1234, size: 2},
                    {data: 0x5678, size: 2},
                    {data: 0x12345678, size: 4},
                    {data: 0x87654321, size: 4},
                    {data: BigInt("0x123456789ABCDEF0"), size: 8},
                    {data: new TextEncoder().encode("Test1234")},

                ])
            assert.deepEqual(result, new Uint8Array([
                0x12,
                0x34,
                0x34, 0x12,
                0x78, 0x56,
                0x78, 0x56, 0x34, 0x12,
                0x21, 0x43, 0x65, 0x87,
                0xF0, 0xDE, 0xBC, 0x9A, 0x78, 0x56, 0x34, 0x12,
                84, 101, 115, 116, 49, 50, 51, 52
            ]))
        })
    })

    context('calculateSize', () => {
        it('Should calculate the correct size for a fictional small file list', () => {
            const result = ZipUtils.calculateSize([
                {name: "testFile.txt", size: 100},
                {name: "testFile2.txt", size: 200},
                {name: "testFile3", size: 1000}
            ])
            assert.equal(result, BigInt(1654))
        })
        it('Should calculate the correct size for a fictional big file list (zip64)', () => {
            const result = ZipUtils.calculateSize([
                {name: "testFile.txt", size: 1000000000},
                {name: "testFile2.txt", size: 2000000000},
                {name: "testFile3", size: 3000000000}
            ])
            assert.equal(result.toString(), "6000000646")
        })
    })

    context('ZipStructs', () => {
        it('Should calculate the right time representation', () => {
            const result = ZipUtils.getTimeStruct(new Date("1996-04-23 16:20:10"))
            assert.equal(result, 33413)
        })
        it('Should calculate the right date representation', () => {
            const result = ZipUtils.getDateStruct(new Date("1996-04-23 16:20:10"))
            assert.equal(result, 8343)
        })
    })
})

describe('Zip', () => {
    context('Normal zip', async () => {
        let testZip = null
        const tempZipName = `temp-${crypto.randomBytes(3).toString('hex')}.zip`
        step('Begin zip and pipe output', () => {
            const writeStream = fs.createWriteStream(tempZipName)
            testZip = new Zip(false)
            testZip.outputStream.pipe(writeStream)
        })
        step('Start file', () => {
            testZip.startFile('testFile.bin')
        })
        step('Stream in file data', async () => {
            const readBuffer = await fs.promises.readFile(path.join(__dirname, 'testFile.bin'))
            testZip.appendData(readBuffer)
        })
        step('End file', () => {
            testZip.endFile()
        })
        step('End zip', () => {
            testZip.finish()
        })
        step('Check zip contents against input data', async () => {
            const zipReader = await jszip.loadAsync(fs.readFileSync(tempZipName), {base64: false, checkCRC32: true})
            assert.ok(zipReader.files['testFile.bin'])
            assert.deepEqual(await zipReader.file("testFile.bin").async('uint8array'), await fs.promises.readFile(path.join(__dirname, 'testFile.bin')))
        })
    })

    context('Small zip64', async () => {
        let testZip = null
        const tempZipName = `temp64-${crypto.randomBytes(3).toString('hex')}.zip`
        step('Begin zip and pipe output', () => {
            const writeStream = fs.createWriteStream(tempZipName)
            testZip = new Zip(true)
            testZip.outputStream.pipe(writeStream)
        })
        step('Start file', () => {
            testZip.startFile('testFile.bin')
        })
        step('Stream in file data', async () => {
            const readBuffer = await fs.promises.readFile(path.join(__dirname, 'testFile.bin'))
            testZip.appendData(readBuffer)
        })
        step('End file', () => {
            testZip.endFile()
        })
        step('End zip', () => {
            testZip.finish()
        })
        step('Check zip contents against input data', async () => {
            const zipReader = await jszip.loadAsync(fs.readFileSync(tempZipName), {base64: false, checkCRC32: true})
            assert.ok(zipReader.files['testFile.bin'])
            assert.deepEqual(await zipReader.file("testFile.bin").async('uint8array'), await fs.promises.readFile(path.join(__dirname, 'testFile.bin')))
        })
    })

    context('Big zip64', async () => {
        let testZip = null
        const tempZipName = `temp64-big-${crypto.randomBytes(3).toString('hex')}.zip`
        step('Begin zip and pipe output', () => {
            const writeStream = fs.createWriteStream(tempZipName)
            testZip = new Zip(true)
            testZip.outputStream.pipe(writeStream)
        })
        step('Add a lot of files to get above 1GB', async () => {
            for(let i=0; i<1000; i++){
                const name = `testFile${i}.bin`
                testZip.startFile(name)
                const readBuffer = await fs.promises.readFile(path.join(__dirname, 'testFile.bin'))
                testZip.appendData(readBuffer)
                testZip.endFile()
            }
        }).timeout(120*1000)
        step('End zip', () => {
            testZip.finish()
        })
        step('Check zip contents against input data', async () => {
            const zipReader = await jszip.loadAsync(await fs.promises.readFile(tempZipName), {base64: false, checkCRC32: true})
            assert.ok(zipReader.files['testFile999.bin'])
            assert.deepEqual(await zipReader.file("testFile999.bin").async('uint8array'), await fs.promises.readFile(path.join(__dirname, 'testFile.bin')))
        }).timeout(120*1000)
    })

    // TODO: Add >4GB tests
})