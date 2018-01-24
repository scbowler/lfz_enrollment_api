const express = require('express');
const path = require('path');
const cors = require('cors');
const { sendData, getData, getNextRowNumber, getSheets, sheetExists, newSheet } = require('./google_sheet');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

app.post('/send-data', sendData);

app.post('/get-data', getData);

app.get('/test', (req, res) => {
    getNextRowNumber().then(row => {
        console.log('Row:', row);

        res.send(`<h1>Row: ${row}</h1>`);
    });
});

app.get('/get-sheets', getSheets);

app.get('/sheet-exists', (req, res) => {
    const exists = sheetExists('Mar 5th 2018');
    console.log('Sheet Exists:', exists);
    res.send(`<h1>Sheet Exists: ${exists}</h1>`);
});

app.get('/create-sheet', (req, res) => {
    const name = 'Mar 32th 2234';
    
    newSheet(name);

    res.send(`<h1>Creating New Sheet Named: <b>${name}</b></h1>`);
});

app.listen(PORT, () => {
    console.log('Server running on PORT: ' + PORT);
});
