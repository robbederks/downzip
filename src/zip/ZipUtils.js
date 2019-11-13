import WorkerUtils from '../WorkerUtils'

const Utils = new WorkerUtils('ZipUtils')
const LITTLE_ENDIAN = true

class ZipUtils {
    // Data is an array in the format: [{data: 0x0000, size: 2} or {data: Buffer()}, ...]
    createByteArray = (data) => {
        const size = data.reduce((acc, value) => {
            return acc + (value.size ? value.size : value.data.length)
        }, 0)
        const array = new Uint8Array(size)
        const dataView = new DataView(array.buffer)

        let i = 0
        data.forEach((entry) => {
            if(entry.data.length !== undefined){
                // Entry data is some kind of buffer / array
                array.set(entry.data, i)
                i += entry.data.length
            } else {
                // Entry data is some kind of integer
                switch (entry.size) {
                    case 1:
                        dataView.setInt8(i, parseInt(entry.data))
                        break
                    case 2:
                        dataView.setInt16(i, parseInt(entry.data), LITTLE_ENDIAN)
                        break
                    case 4:
                        dataView.setInt32(i, parseInt(entry.data), LITTLE_ENDIAN)
                        break
                    case 8:
                        dataView.setBigInt64(i, BigInt(entry.data), LITTLE_ENDIAN)
                        break
                    default:
                        Utils.error(`createByteArray: No handler defined for data size ${entry.size} of entry data ${JSON.stringify(entry.data)}`)
                }
                i += entry.size
            }
        })
        console.log(array)
        return array
    }
}

const staticZipUtils = new ZipUtils()
export default staticZipUtils