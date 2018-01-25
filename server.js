const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

routes(app);

app.listen(PORT, () => {
    console.log('Server running on PORT: ' + PORT);
});
