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
        const readStream = fs.createReadStream(filePath);
        readStream.on("error", (err) => {
            console.error(`Read file error!`);
            console.error(err);
        });

        readStream.on("close", () => {
            console.info(`Read file is complete!`);
        });

        fetch(`${url}/upload`, {method: 'POST', body: readStream })
        .then(() => {
            console.info(`Upload file is complete!`);
        })
        .catch((err) => {
            console.error('Uploading file error!');
            console.error(err);
        });
        break;
    }
    case "download": {
        console.info(`Downloading...`);
        const writeSteam = fs.createWriteStream(filePath);
        fetch(`${url}/download`)
        .then(response => {
            return pipelinePromise(response.body, writeSteam)
        })
        .then(() => {
            console.info(`Download file is complete!`);
        })
        .catch(err => {
            console.error(`Downloading file error!`);
            console.error(err);
        });
        break;
    }
}