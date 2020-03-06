const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.static(path.resolve(__dirname, 'client', 'dist')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

authRoutes(app);
apiRoutes(app);
routes(app);

app.listen(PORT, () => {
    console.log('LFZ Enrollment API running on PORT: ' + PORT);
});
