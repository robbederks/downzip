import '@babel/polyfill'
import WorkerUtils from './WorkerUtils'
import Zip from './zip/Zip'
const Utils = new WorkerUtils('DownZipServiceWorker')

// /////////// GLOBAL OBJECTS /////////// //
const zipMap = {}

// ////////// MESSAGE HANDLERS ////////// //
const initialize = (data, ports) => {
    Utils.log(`Initialize called: ${JSON.stringify(data)}`)
    const {id, files} = data

    // Decide whether to use zip64
    const totalSizeBig = files.reduce((acc, val) => acc + BigInt(val.size), BigInt(0))
    Utils.log(`Total file size: ${totalSizeBig}`)
    const zip64 = (totalSizeBig >= BigInt(0xEFFFFFFF))  // Not up to 0xFFFFFFFF due to added headers and stuff

    // Start new Zip object and add to the map
    zipMap[id] = {
        files,
        zip: new Zip(zip64),
        sizeBig: totalSizeBig
    }
    console.log(zipMap)

    // Acknowledge reception
    if(ports.length > 0)
        ports[0].postMessage({command: 'ACKNOWLEDGE'})
}

// /////////// EVENT HANDLERS /////////// //
self.addEventListener('install', () => {
    Utils.log("Installing worker")
})

self.addEventListener('activate', () => {
    Utils.log("Activating worker")
})

self.addEventListener('fetch', async (event) => {
    // Get URL and check if it is a download request
    const urlParts = event.request.url.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    if(lastPart.includes('download-')) {
        // Get download id
        const id = lastPart.replace('download-', '')
        Utils.log(`Fetch called for download id: ${id}`)

        // Check if initialized
        if(!zipMap[id]){
            Utils.error(`No zip initialized for id: ${id}`)
            return
        }

        // Respond with the zip outputStream
        event.respondWith(new Response(
            zipMap[id].zip.outputStream,
            {headers: new Headers({
                'Content-Type': 'application/octet-stream; charset=utf-8',
                'Content-Disposition': 'attachment; filename="attachmenet-bundle.zip"',
                'Content-Length': zipMap[id].sizeBig  // This is an approximation, does not take into account the headers
            })}
        ))

        // Start feeding zip the downloads
        for(let i=0; i<zipMap[id].files.length; i++){
            const file = zipMap[id].files[i]

            // Start new file in the zip
            zipMap[id].zip.startFile(file.name)

            // Append all the downloaded data
            await new Promise((resolve, reject) => {
                fetch(file.downloadUrl).then(response => response.body).then(async (stream) => {
                    const reader = stream.getReader()
                    let doneReading = false
                    while(!doneReading){
                        const chunk = await reader.read()
                        const {done, value} = chunk

                        if(done) {
                            // If this stream has finished, resolve and return
                            resolve()
                            doneReading = true
                        } else {
                            // If not, append data to the zip
                            zipMap[id].zip.appendData(value)
                        }
                    }
                }).catch((err) => reject(err))
            })

            // End file
            zipMap[id].zip.endFile()
        }

        // End zip
        zipMap[id].zip.finish()
        Utils.log("Done with this zip!")
    } else {
        Utils.log('Fetch called for a non-download. Doing nothing')
    }
})

const messageHandlers = {
    'INITIALIZE': initialize
}
self.addEventListener('message', async (event) => {
    const {data, ports} = event
    console.log(event)
    const handler = messageHandlers[data.command]
    if(handler){
        await handler(data.data, ports)
    } else {
        Utils.error(`Handler for command does not exist: ${data.command}`)
    }
})