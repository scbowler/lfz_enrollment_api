const Authentication = require('../controllers/authentication');
const passport = require('passport');

require('../services/passport');

const requireSignIn = passport.authenticate('local', { session: false });

module.exports = app => {
    app.post('/auth/login', requireSignIn, Authentication.signin);
    app.post('/auth/register', Authentication.signup);
}