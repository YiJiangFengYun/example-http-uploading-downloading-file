const fs = require("fs");
const pipeline = require("stream").pipeline;
const promisify = require("util").promisify;
const fetch = require('node-fetch').default;

const pipelinePromise = promisify(pipeline);

const filePath = './file-client';
const strOption = process.argv[2];
console.info(`Operate string: ${strOption}`);

const url = 'http://127.0.0.1:3000';

switch (strOption) {
    case "upload": {
        console.info(`Uploading...`);

        let byteCurr = 0;
        let byteTotal = fs.statSync(filePath).size;
        let idInterval = 0;

        const readStream = fs.createReadStream(filePath);
        readStream.on("error", (err) => {
            console.error(`Read file error!`);
            console.error(err);
        });

        readStream.on("close", () => {
            console.info(`Read file is complete!`);
        });

        const update = () => {
            byteCurr = readStream.bytesRead;
            if (byteTotal) {
                console.info(`Uploading: ${((byteCurr / byteTotal) * 100).toFixed(2)}%`);
            }
        }

        idInterval = setInterval(update, 500);

        fetch(`${url}/upload`, {method: 'POST', body: readStream })
        .then((response) => {
            console.info(`Requesting ok!`);
            response.headers.forEach((value, name) => {
                console.info(`Header ${name}:${value}`);
            });

            clearInterval(idInterval);

            console.info(`Upload file is complete!`);
        })
        .catch((err) => {

            clearInterval(idInterval);

            console.error('Uploading file error!');
            console.error(err);
        });
        break;
    }
    case "download": {
        console.info(`Downloading...`);
        let byteCurr = 0;
        let byteTotal = 0;
        let idInterval = 0;
        const writeSteam = fs.createWriteStream(filePath);

        const update = () => {
            byteCurr = writeSteam.bytesWritten;
            if (byteTotal) {
                console.info(`Downloading: ${((byteCurr / byteTotal) * 100).toFixed(2)}%`);
            }
        }

        fetch(`${url}/download`)
        .then(response => {
            console.info(`Requesting ok!`);
            response.headers.forEach((value, name) => {
                console.info(`Header ${name}:${value}`);
            });

            byteTotal = Number(response.headers.get('content-length'));

            idInterval = setInterval(update, 500);

            return pipelinePromise(response.body, writeSteam);
        })
        .then(() => {

            clearInterval(idInterval);

            console.info(`Download file is complete!`);
        })
        .catch(err => {

            clearInterval(idInterval);

            console.error(`Downloading file error!`);
            console.error(err);
        });
        break;
    }
}