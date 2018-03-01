const express = require('express');
const https = require('https');
const path = require('path');
const cors = require('cors');
const { sslOptions } = require('./config');
const routes = require('./routes');
const PORT = process.env.PORT || 9000;
const ENV = process.env.ENV || 'production';

const app = express();

// app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

routes(app);

if(ENV !== 'production' && ENV !== 'livedev'){
    
}

switch(ENV){
    case 'production':
        https.createServer(sslOptions, app).listen(443, () => {
            console.log('HTTPS server running on PORT:443');
        });
        break;
    case 'livedev':
        exports.app = app;
        break;
    default:
        app.listen(PORT, () => {
            console.log('Server running on PORT: ' + PORT);
        });
}
