import registerServiceWorker from 'service-worker-loader!./downzip-sw'

const SCOPE = 'downzip'

class DownZip {
    constructor(){
        this.worker = null

        // Register service worker and let it intercept our scope
        registerServiceWorker({
            scope: `./${SCOPE}/`
        }).then(result => {
            console.log('[DownZip] Service worker registered successfully:', result)
            this.worker = result.active
        }).catch(error => {
            console.error('[DownZip] Service workers not loaded:', error)
        })
    }

    sendMessage(command, data){
        this.worker.postMessage({
            command,
            data
        })
    }

    downzip(id, urls){
        // Check if worker got created in the constructor
        if(!this.worker){
            console.error("[DownZip] No service worker registered!")
            return
        }

        // Init this task in our service worker
        this.sendMessage('initialize', {
            id,
            urls
        })

        // Return download URL
        return `${SCOPE}/download-${id}`
    }
}

export default DownZip