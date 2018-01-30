const { sendData, getData, syncSheets } = require('../services/google_sheet');
const sendEmail = require('../services/email');

module.exports = app => {
    // app.get('/', (req, res) => {
    //     res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
    // });

    // app.post('/get-data', getData);

    app.post('/send-data', sendData);

    app.get('/sync-sheets', syncSheets);
}
