const passport = require('passport');
const { getClassList, sendData, getRoster, syncSheets, attendance } = require('../services/google_sheet');

const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = app => {

    app.get('/api/test-route', requireAuth, (req, res) => {
        res.send({
            message: 'This is protected information from api routes'
        });
    });

    app.get('/api/get-sheet-data', requireAuth, getClassList);

    app.get('/api/sync-sheets', requireAuth, syncSheets);

    app.post('/api/get-roster', requireAuth, getRoster);

    app.post('/api/send-data', sendData);

    app.post('/api/attendance', attendance);
}
