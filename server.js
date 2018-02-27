const express = require('express');
const path = require('path');
const cors = require('cors');
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
}

exports.app = app;
