const DEBUG = false

class WorkerUtils {
    constructor(name){
        this.name = name
    }

    error = (message) => {
        console.error(`[${this.name}] ${message}`)
    }

    log = (message) => {
        DEBUG && console.log(`[${this.name}] ${message}`)
    }
}

export default WorkerUtils