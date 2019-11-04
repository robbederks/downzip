import '@babel/polyfill'
import WorkerUtils from './WorkerUtils'
const Utils = new WorkerUtils('DownZipServiceWorker')

// ////////// MESSAGE HANDLERS ////////// //
const initialize = (data) => {
    Utils.log(`Initialize called: ${data}`)
}

// /////////// EVENT HANDLERS /////////// //
self.addEventListener('install', () => {
    Utils.log("Installing worker")
})

self.addEventListener('activate', () => {
    Utils.log("Activating worker")
})

self.addEventListener('fetch', (event) => {
    Utils.log(`Fetch called: ${event}`)
})

const messageHandlers = {
    'INITIALIZE': initialize
}
self.addEventListener('message', async (event) => {
    const {data} = event
    const handler = messageHandlers[data.command]
    if(handler){
        await handler(data.data)
    } else {
        Utils.error(`Handler for command does not exist: ${data.command}`)
    }
})