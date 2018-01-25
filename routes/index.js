const { sendData, getData, syncSheets } = require('../services/google_sheet');

module.exports = app => {
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
    });

    app.post('/send-data', sendData);

    app.post('/get-data', getData);

    app.get('/sync-sheets', syncSheets);
}
