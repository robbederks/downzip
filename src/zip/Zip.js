// Based on the implementation specified in: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
import WorkerUtils from '../WorkerUtils'
import Crc32 from 'Crc32'
import ZipUtils from 'ZipUtils'

const Utils = new WorkerUtils('Zip')

class Zip {
    constructor(zip64){
        // Enable large zip compatibility?
        this.zip64 = zip64

        // Setup file record
        this.fileRecord = []
        this.finished = false

        // Setup byte counter
        this.byteCounterBig = 0n

        // Setup output stream
        this.outputStream = new ReadableStream({
            start: (controller) => {
                Utils.log('OutputStream has started!')
                this.outputController = controller
            },
            cancel: () => {
                Utils.error('OutputStream has been canceled!')
            }
        })
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

    // API
    startFile = (fileName) => {
        if(!this.finished && (this.fileRecord.length === 0 || (this.fileRecord[this.fileRecord.length - 1].done === true))) {
            const date = new Date(Date.now())

            // Add file to record
            this.fileRecord = [
                ...this.fileRecord,
                {
                    name: fileName,
                    sizeBig: 0n,
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
                {data: ((((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2), size: 2},
                {data: (((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate()), size: 2},
                {data: 0x00000000, size: 4},
                {data: (this.zip64 ? 0xFFFFFFFF : 0x00000000), size: 4},
                {data: (this.zip64 ? 0xFFFFFFFF : 0x00000000), size: 4},
                {data: nameBuffer.length, size: 2},
                {data: (this.zip64 ? 32 : 0), size: 2},
                {data: nameBuffer},
                {data: (this.zip64 ? this.getZip64ExtraField(0n, this.byteCounterBig) : [])}
            ])

            // Write header to output stream and add to byte counter
            this.outputController.enqueue(header)
            this.byteCounterBig += header.length
        } else {
            Utils.error("Tried adding file while adding other file or while zip has finished")
        }
    }

    appendData = (data) => {
        if(this.fileRecord.length > 0 && (this.fileRecord[this.fileRecord.length - 1].done === false) && !this.finished){
            // Write data to output stream, add to CRC and increment the file and global size counters
            this.outputController.enqueue(data)
            this.byteCounterBig += data.length
            this.fileRecord[this.fileRecord.length - 1].crc.append(data)
            this.fileRecord[this.fileRecord.length - 1].sizeBig += data.length
        } else {
            Utils.error('Tried to append file data, but there is no open file!')
        }
    }

    endFile = () => {
        if(this.fileRecord.length > 0 && (this.fileRecord[this.fileRecord.length - 1].done === false) && !this.finished) {
            const file = this.fileRecord[this.fileRecord.length - 1]
            const dataDescriptor = ZipUtils.createByteArray([
                {data: file.crc.get(), size: 4},
                {data: file.sizeBig, size: (this.zip64 ? 8 : 4)},
                {data: file.sizeBig, size: (this.zip64 ? 8 : 4)}
            ])
            this.outputController.enqueue(dataDescriptor)
            this.byteCounterBig += dataDescriptor.length
            this.fileRecord[this.fileRecord.length - 1].done = true
        } else {
            Utils.error('Tried to end file, but there is no open file!')
        }
    }

    finish = () => {
        if(this.fileRecord.length > 0 && (this.fileRecord[this.fileRecord.length - 1].done === true) && !this.finished){
            // Write central directory headers
            let centralDirectorySize = 0n
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
                    {data: ((((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2), size: 2},
                    {data: (((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate()), size: 2},
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
                this.outputController.enqueue(header)
                this.byteCounterBig += header.length
                centralDirectorySize += header.length
            })

            if(this.zip64){
                // Write zip64 end of central directory record
                const zip64EndOfCentralDirectoryRecordStartBig = this.byteCounterBig
                const zip64EndOfCentralDirectoryRecord = ZipUtils.createByteArray([
                    {data: 0x06064b50, size: 4},
                    {data: 44, size: 8},
                    {data: 0x002D, size: 2},
                    {data: 0x002D, size: 2},
                    {data: 1, size: 4},
                    {data: 0, size: 4},
                    {data: this.fileRecord.length, size: 8},
                    {data: this.fileRecord.length, size: 8},
                    {data: centralDirectorySize, size: 8},
                    {data: centralDirectoryStartBig, size: 8}
                ])
                this.outputController.enqueue(zip64EndOfCentralDirectoryRecord)
                this.byteCounterBig += zip64EndOfCentralDirectoryRecord.length

                // Write zip64 end of central directory locator
                const zip64EndOfCentralDirectoryLocator = ZipUtils.createByteArray([
                    {data: 0x07064b50, size: 4},
                    {data: 0, size: 4},
                    {data: zip64EndOfCentralDirectoryRecordStartBig, size: 8},
                    {data: 1, size: 4}
                ])
                this.outputController.enqueue(zip64EndOfCentralDirectoryLocator)
                this.byteCounterBig += zip64EndOfCentralDirectoryLocator.length
            }

            const endOfCentralDirectoryRecord = ZipUtils.createByteArray([
                {data: 0x06054b50, size: 4},
                {data: 0, size: 2},
                {data: 0, size: 2},
                {data: (this.zip64 ? 0xFFFF : this.fileRecord.length), size: 2},
                {data: (this.zip64 ? 0xFFFF : this.fileRecord.length), size: 2},
                {data: (this.zip64 ? 0xFFFFFFFF : centralDirectorySize), size: 4},
                {data: (this.zip64 ? 0xFFFFFFFF : centralDirectoryStartBig), size: 4},
                {data: 0, size: 2}
            ])
            this.outputController.enqueue(endOfCentralDirectoryRecord)
            this.byteCounterBig += endOfCentralDirectoryRecord.length

            this.finished = true
            Utils.log(`Done writing zip file. Wrote ${this.fileRecord.length} files and a total of ${this.byteCounterBig} bytes.`)
        } else {
            Utils.error('Empty zip, or there is still a file open')
        }
    }
}