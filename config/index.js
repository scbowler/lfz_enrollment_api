const ENV = process.env.ENV || 'dev';
let config = {};

if(ENV === 'production'){
    config = require('./production');
} else {
    config = require('./dev');
}

module.exports = config;
