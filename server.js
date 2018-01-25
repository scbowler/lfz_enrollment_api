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

app.get('/get-sheets', getSheets);

app.listen(PORT, () => {
    console.log('Server running on PORT: ' + PORT);
});
