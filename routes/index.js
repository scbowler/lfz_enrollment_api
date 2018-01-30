const { sendData, getData, syncSheets } = require('../services/google_sheet');
const sendEmail = require('../services/email');

module.exports = app => {
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
    });

    app.post('/send-data', sendData);

    app.post('/get-data', getData);

    app.get('/sync-sheets', syncSheets);

    app.post('/test', (req, res) => {
        console.log('Test:', req.body);

        res.send({success: true});
    });

    app.get('/send-email', (req, res) => {
        sendEmail({
            test: 'Here is a test message',
            error: 'The error is stuff went wrong',
            msg: 'There was an error',
            nested: {
                stuff: {
                    more: 'Really nested',
                    work: 'maybe'
                },
                strStuff: 'Here is a nested string',
                newStuff: 'Here is some additional information...'
            }
        });

        res.send({msg: '<h1>Sending Email</h1>'});
    });
}
