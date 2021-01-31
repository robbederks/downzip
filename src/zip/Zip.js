// Based on the implementation specified in: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
import WorkerUtils from '../WorkerUtils'
import Crc32 from './Crc32'
import ZipUtils from './ZipUtils'

// Polyfill ReadableStream if not in browser
let ReadableStreamLocal = (typeof ReadableStream == "undefined") ? require('stream').Readable : ReadableStream

const Utils = new WorkerUtils('Zip')

class Zip {
    constructor(zip64){
        // Enable large zip compatibility?
        this.zip64 = zip64
        Utils.log(`Started zip with zip64: ${this.zip64}`)

        // Setup file record
        this.fileRecord = []
        this.finished = false

        // Setup byte counter
        this.byteCounterBig = BigInt(0)

        // Setup output stream
        this.outputStream = new ReadableStreamLocal({
            start: (controller) => {
                Utils.log('OutputStream has started!')
                this.outputController = controller
            },
            cancel: () => {
                Utils.error('OutputStream has been canceled!')
            },
            read: () => {}
        })
    }

    // To also work with the node version of readable stream (for testing)
    enqueue = (data) => {
        this.outputController ? this.outputController.enqueue(data) : this.outputStream.push(data)
    }

    close = () => {
        this.outputController ? this.outputController.close() : this.outputStream.destroy()
    }

    // Generators
    getZip64ExtraField = (fileSizeBig, localFileHeaderOffsetBig) => {
        return ZipUtils.createByteArray([
            {data: 0x0001, size: 2},
            {data: 28, size: 2},
            {data: fileSizeBig, size: 8},
            {data: fileSizeBig, size: 8},
            {data: localFileHeaderOffsetBig, size: 8},
            {data: 0, size: 4}
        ])
    }

    isWritingFile = () => (this.fileRecord.length > 0 && (this.fileRecord[this.fileRecord.length - 1].done === false))

    // API
    startFile = (fileName) => {
        if(!this.isWritingFile() && !this.finished) {
            Utils.log(`Start file: ${fileName}`)
            const date = new Date(Date.now())

            // Add file to record
            this.fileRecord = [
                ...this.fileRecord,
                {
                    name: fileName,
                    sizeBig: BigInt(0),
                    crc: new Crc32(),
                    done: false,
                    date,
                    headerOffsetBig: this.byteCounterBig
                }
            ]

            // Generate Local File Header
            const nameBuffer = new TextEncoder().encode(fileName)
            const header = ZipUtils.createByteArray([
                {data: 0x04034B50, size: 4},
                {data: 0x002D, size: 2},
                {data: 0x0808, size: 2},
                {data: 0x0000, size: 2},
                {data: ZipUtils.getTimeStruct(date), size: 2},
                {data: ZipUtils.getDateStruct(date), size: 2},
                {data: 0x00000000, size: 4},
                {data: (this.zip64 ? 0xFFFFFFFF : 0x00000000), size: 4},
                {data: (this.zip64 ? 0xFFFFFFFF : 0x00000000), size: 4},
                {data: nameBuffer.length, size: 2},
                {data: (this.zip64 ? 32 : 0), size: 2},
                {data: nameBuffer},
                {data: (this.zip64 ? this.getZip64ExtraField(BigInt(0), this.byteCounterBig) : [])}
            ])

            // Write header to output stream and add to byte counter
            this.enqueue(header)
            this.byteCounterBig += BigInt(header.length)
        } else {
            Utils.error("Tried adding file while adding other file or while zip has finished")
        }
    }

    appendData = (data) => {
        try {
            if (this.isWritingFile() && !this.finished) {
                // Write data to output stream, add to CRC and increment the file and global size counters
                this.enqueue(data)
                this.byteCounterBig += BigInt(data.length)
                this.fileRecord[this.fileRecord.length - 1].crc.append(data)
                this.fileRecord[this.fileRecord.length - 1].sizeBig += BigInt(data.length)
            } else {
                Utils.error('Tried to append file data, but there is no open file!')
            }
        } catch (e) {
            Utils.error(e)
        }
    }

    endFile = () => {
        try {
            if(this.isWritingFile() && !this.finished) {
                const file = this.fileRecord[this.fileRecord.length - 1]
                Utils.log(`End file: ${file.name}`)
                const dataDescriptor = ZipUtils.createByteArray([
                    {data: file.crc.get(), size: 4},
                    {data: file.sizeBig, size: (this.zip64 ? 8 : 4)},
                    {data: file.sizeBig, size: (this.zip64 ? 8 : 4)}
                ])
                this.enqueue(dataDescriptor)
                this.byteCounterBig += BigInt(dataDescriptor.length)
                this.fileRecord[this.fileRecord.length - 1].done = true
            } else {
                Utils.error('Tried to end file, but there is no open file!')
            }
        } catch (e) {
            Utils.error(e)
        }
    }

    finish = () => {
        if(!this.isWritingFile() && !this.finished){
            Utils.log(`Finishing zip`)
            // Write central directory headers
            let centralDirectorySizeBig = BigInt(0)
            const centralDirectoryStartBig = this.byteCounterBig
            this.fileRecord.forEach((file) => {
                const {date, crc, sizeBig, name, headerOffsetBig} = file
                const nameBuffer = new TextEncoder().encode(name)
                const header = ZipUtils.createByteArray([
                    {data: 0x02014B50, size: 4},
                    {data: 0x002D, size: 2},
                    {data: 0x002D, size: 2},
                    {data: 0x0808, size: 2},
                    {data: 0x0000, size: 2},
                    {data: ZipUtils.getTimeStruct(date), size: 2},
                    {data: ZipUtils.getDateStruct(date), size: 2},
                    {data: crc.get(), size: 4},
                    {data: (this.zip64 ? 0xFFFFFFFF : sizeBig), size: 4},
                    {data: (this.zip64 ? 0xFFFFFFFF : sizeBig), size: 4},
                    {data: nameBuffer.length, size: 2},
                    {data: (this.zip64 ? 32 : 0), size: 2},
                    {data: 0x0000, size: 2},
                    {data: 0x0000, size: 2},
                    {data: 0x0000, size: 2},
                    {data: 0x00000000, size: 4},
                    {data: (this.zip64 ? 0xFFFFFFFF : headerOffsetBig), size: 4},
                    {data: nameBuffer},
                    {data: (this.zip64 ? this.getZip64ExtraField(sizeBig, headerOffsetBig) : [])}
                ])
                this.enqueue(header)
                this.byteCounterBig += BigInt(header.length)
                centralDirectorySizeBig += BigInt(header.length)
            })

            if(this.zip64){
                // Write zip64 end of central directory record
                const zip64EndOfCentralDirectoryRecordStartBig = this.byteCounterBig
                const zip64EndOfCentralDirectoryRecord = ZipUtils.createByteArray([
                    {data: 0x06064b50, size: 4},
                    {data: 44, size: 8},
                    {data: 0x002D, size: 2},
                    {data: 0x002D, size: 2},
                    {data: 0, size: 4},
                    {data: 0, size: 4},
                    {data: this.fileRecord.length, size: 8},
                    {data: this.fileRecord.length, size: 8},
                    {data: centralDirectorySizeBig, size: 8},
                    {data: centralDirectoryStartBig, size: 8}
                ])
                this.enqueue(zip64EndOfCentralDirectoryRecord)
                this.byteCounterBig += BigInt(zip64EndOfCentralDirectoryRecord.length)

                // Write zip64 end of central directory locator
                const zip64EndOfCentralDirectoryLocator = ZipUtils.createByteArray([
                    {data: 0x07064b50, size: 4},
                    {data: 0, size: 4},
                    {data: zip64EndOfCentralDirectoryRecordStartBig, size: 8},
                    {data: 1, size: 4}
                ])
                this.enqueue(zip64EndOfCentralDirectoryLocator)
                this.byteCounterBig += BigInt(zip64EndOfCentralDirectoryLocator.length)
            }

            const endOfCentralDirectoryRecord = ZipUtils.createByteArray([
                {data: 0x06054b50, size: 4},
                {data: 0, size: 2},
                {data: 0, size: 2},
                {data: (this.zip64 ? 0xFFFF : this.fileRecord.length), size: 2},
                {data: (this.zip64 ? 0xFFFF : this.fileRecord.length), size: 2},
                {data: (this.zip64 ? 0xFFFFFFFF : centralDirectorySizeBig), size: 4},
                {data: (this.zip64 ? 0xFFFFFFFF : centralDirectoryStartBig), size: 4},
                {data: 0, size: 2}
            ])
            this.enqueue(endOfCentralDirectoryRecord)
            this.close()
            this.byteCounterBig += BigInt(endOfCentralDirectoryRecord.length)

            this.finished = true
            Utils.log(`Done writing zip file. Wrote ${this.fileRecord.length} files and a total of ${this.byteCounterBig} bytes.`)
        } else {
            Utils.error('Empty zip, or there is still a file open')
        }
    }
}

export default Zip
