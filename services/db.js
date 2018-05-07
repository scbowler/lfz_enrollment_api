const mongoose = require('mongoose');
const { dbConnect } = require('../config');

mongoose.Promise = Promise;

const db = mongoose.createConnection(dbConnect, (err) => {
    if (err) return console.log('Unable to connect to DB:', err.message);

    console.log('Connected to DB');
});

module.exports = db;
