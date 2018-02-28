const express = require('express');
const https = require('https');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { resolve } = require('path');
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
    app.listen(PORT, () => {
        console.log('Server running on PORT: ' + PORT);
    });
}else if(ENV === 'production'){

    const sslOptions = {
	key: fs.readFileSync(resolve(__dirname, 'ssl', 'private.key')),
	cert: fs.readFileSync(resolve(__dirname, 'ssl', 'server_cert.crt')),
	ca: fs.readFileSync(resolve(__dirname, 'ssl', 'ca.crt'))
    };

    https.createServer(sslOptions, app).listen(443, () => {
	console.log('HTTPS server running on PORT:443');
    });
}
