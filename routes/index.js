const { sendData, getData, syncSheets } = require('../services/google_sheet');

module.exports = app => {
    // app.post('/get-data', getData);

    app.post('/send-data', sendData);

    app.get('/sync-sheets', syncSheets);

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
    });
}
