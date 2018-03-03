const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = app => {

    app.get('/api/test-route', requireAuth, (req, res) => {
        res.send({
            message: 'This is protected information from api routes'
        });
    });
}