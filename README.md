# DownZip
[![Maintainability](https://api.codeclimate.com/v1/badges/862b0665619d30cd322e/maintainability)](https://codeclimate.com/github/robbederks/downzip/maintainability)[ ![Test Coverage](https://api.codeclimate.com/v1/badges/862b0665619d30cd322e/test_coverage)](https://codeclimate.com/github/robbederks/downzip/test_coverage)

The `package.json` description says it all: "Library to enable client-side code to stream potentially large files into a zipped download"

## Features
* Client-side generation of ZIP files from supplied single-file download URLs
* Support for ZIP64 (ZIP files bigger than 4GB)
* Everything is streamed, no data has to be held in RAM
* No compression is applied, so the CPU load is tiny

## Installation
1. Install npm package: `npm install downzip`
2. Make sure the service worker is copied to your output directory. For example, setup [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) to put the service worker in your output directory:
```
// Add copy rule for downzip service worker
new CopyPlugin([
    {
        from: 'node_modules/downzip/dist/downzip-sw.js',
        to: '.'
    }
])
```

## Example usage
```
import DownZip from 'downzip'

// Setup downzip object
const downZip = new DownZip()
await downZip.register()

// Initialize download
const downloadId = "aaaabbbb"
const zipFileName = "downzip-file"
const files = [
    {
        name: 'picture1.jpg' 
        downloadUrl: 'http://your-download-url.com/picture1.jpg'
        size: 1234      // In bytes
    }, 
    {
        name: 'picture2.jpg' 
        downloadUrl: 'http://your-download-url.com/picture2.jpg'
        size: 4567      // In bytes
    }
]
const downloadUrl = await downZip.downzip(
    downloadId,
    zipFileName,
    files
)

```
```
// Start download when user clicks the link
<a href={downloadUrl}>Click to start downloading!</a>
```

## service-worker-loader options
Can pass `mapScriptUrl` function to the `register` method. That function gets used by 
service-worker-loader. [docs](https://github.com/mohsen1/service-worker-loader#registerserviceworkermapscripturl-scripturl-string--string-options-registrationoptions-promiseserviceworkerregistration)

```js
    const mapScriptUrl = scriptUrl => scriptUrl.replace('localhost', "127.0.0.1")

   // Setup downzip object
    const downZip = new DownZip()
    await downZip.register({ mapScriptUrl })
```

## TODO
All improvements are welcome, but the main things that need to be improved at the moment are:
* Automated Testing
* Only send the keep-alive service worker message when there is a download queued up / in progress
* Find an easier way to install this package / service worker in projects

Please submit pull requests, I'm more than happy to merge in improvements!


