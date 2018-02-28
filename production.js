const app = require('express')();

app.get('*', (req, res) => {
    res.redirect('https://' + req.get('host') + req.originalUrl);
});

exports.app = app;
