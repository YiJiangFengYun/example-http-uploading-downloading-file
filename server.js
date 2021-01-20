const fs = require('fs');
const express = require('express');

const filePath = './file-server';
const port = 3000;

const app = express();
app.post('/upload', function (req, res, next) {
    req.pipe(fs.createWriteStream(filePath));
    req.on('end', next);
});

app.get('/download', function (req, res) {
    res.download(filePath, (err) => {
        if (err) console.error(err);
    });
});

app.listen(port, () => {
    console.info(`Server is ready and listening on port ${port}`);
});