const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
const spreadsheetId = '1SY3S6V8TXtcC5FxwF9iUvNmpgO_vek2Q-n-5ryBiTIo';

exports.sendData = function(req, res){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        
        authorize(JSON.parse(content), (auth) => addStudent(auth, req, res));
    });
}

exports.getData = function(req, res){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        console.log('GET DATA CALLED');
        
        authorize(JSON.parse(content), (auth) => getClassList(auth, req, res));
    });
}

exports.getSheets = function(req, res){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        console.log('GET SHEETS CALLED');
        
        authorize(JSON.parse(content), (auth) => getAllSheets(auth, req, res));
    });
}

exports.newSheet = function(title){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        console.log('GET SHEETS CALLED');
        
        authorize(JSON.parse(content), (auth) => createNewSheet(auth, title));
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    return new Promise((res, rej) => {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
                rej({success: false, error: 'Generated new token'});
            } else {
                oauth2Client.credentials = JSON.parse(token);
                const result = callback(oauth2Client);
                if(result && result.then){
                    result.then(resp => {
                        res(resp);
                    });
                } else {
                    res({success: true});
                }

            }
        });
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

function writeToSheetsFile(data, cb){

    return new Promise((resolve, reject) => {
        fs.writeFile('./data/sheets.json', JSON.stringify(data), err => {
            if(err) return reject({success: false, error: err});

            resolve({success: true});
        });
    });
}

function getClassList(auth, req, res) {
    var sheets = google.sheets('v4');

    const sheet = req.body.class;

    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: `${sheet}!A1:H`,
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            res.send({success: false, error: 'Google API Error'});
            return;
        }
        var rows = response.values;
        if (rows.length == 0) {
            console.log('No data found.');
            res.send({success: false, error: 'No Data Found'});
        } else {
            console.log('rows:', rows);

            res.send({success: true, rows});
        }
    });
}

function getTemplateId(templateName = 'template'){
    const { sheets } = JSON.parse(fs.readFileSync('./data/sheets.json'));
    const template = sheets[templateName];

    return template ? template.id : false;
}

function createNewSheet(auth, title){

    const templateId = getTemplateId();

    console.log('Template ID:', templateId);

    const sheets = google.sheets('v4');

    sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId,
        fields: 'replies/duplicateSheet/properties/sheetId',
        resource: {requests: [
            {
                duplicateSheet: {
                    newSheetName: title,
                    sourceSheetId: templateId
                }
            }
        ]}
    }, (err, resp) => {
        if(err) return console.log('Error Creating New Sheet:', err);

        const sheetId = resp.replies[0].duplicateSheet.properties.sheetId;
        const saveResp = saveSheetInfoLocal(title, sheetId);

        console.log(`Created new sheet named: ${title}. \nResp Obj:`);
        console.log(sheetId);
        console.log('Save Resp:', saveResp);
    });
}

function addStudent(auth, req, res){
    
    const sheet = req.body.date;

    if(sheetExists(sheet)){
        res.send({success: true, msg: 'Sheet Exists'});
    } else {
        res.send({success: true, msg: 'Sheet Does Not Exist'});
    }
    
    return;
    
    var body = {
        values: [ buildDataArray(req.body) ]
    };

    var sheets = google.sheets('v4');

    getNextRowNumber(sheet).then( row => {
        sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: `${sheet}!A${row}`,
            valueInputOption: 'USER_ENTERED',
            resource: body
        }, function(err, result) {
        if(err) {
            console.log(err);
            res.send({success: false, error: 'Unable to save data'});
        } else {
            console.log('%d cells updated.', result.updatedCells);
            res.send({success: true});
        }
        });
    });
}

function getNextRowNumber(sheet){
    return new Promise((resolve, reject) => {
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return reject({error: 'Error loading client secret file'});
            }
            
            authorize(JSON.parse(content), (auth) => getRowInfo(auth, sheet)).then( res => {
                resolve(res);
            });
        });
    });
}

function getRowInfo(auth, sheet){
    var sheets = google.sheets('v4');

    return new Promise((res, rej) => {
        sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: `${sheet}!A1:C`,
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                rej({success: false, error: 'Google API Error'});
            }
            var rows = response.values;
            
            if (rows.length == 0) {
                res(1);
            } else {
                for(var i = 1; i < rows.length; i++){
                    const row = rows[i];
                    if(!row[1] && !row[2]){
                        
                        return res(i + 1);
                    }
                }
                return res(i + 1);
            }
        });
    });
}

function saveSheetInfoLocal(title, id){
    const data = JSON.parse(fs.readFileSync('./data/sheets.json'));

    data.sheets[title] = id;

    return fs.writeFileSync('./data/sheets.json', JSON.stringify(data));
}

function sheetExists(title){
    const { sheets } = JSON.parse(fs.readFileSync('./data/sheets.json'));
                
    return typeof sheets[title] !== 'undefined';
}

exports.sheetExists = sheetExists;

function getAllSheets(auth, req, res){
    const sheets = google.sheets('v4');

    sheets.spreadsheets.get({
        auth,
        spreadsheetId,
        fields: 'sheets(properties(sheetId,title))'
    }, (err, resp) => {
        if(err){
            console.log('GET SHEETS returned an error:', err);
            return res.send({success: false, error: 'Failed getting sheets'});
        }

        console.log('Response from Get Sheets:', resp);

        const sheetsArr = buildSheetsObj(resp.sheets);

        writeToSheetsFile({sheets: sheetsArr});

        res.send({success: true, data: sheetsArr});
    });
}

exports.getNextRowNumber = getNextRowNumber;

function buildSheetsObj(sheetsArr){
    const sheets = {};

    sheetsArr.map(sheet => sheets[sheet.properties.title] = {id: sheet.properties.sheetId});

    return sheets;
}

function buildDataArray(info){
    const { first_name, last_name, phone, email, date, marketing } = info;
    const sheet = date;
    return [
        null,                                       // #
        new Date().toLocaleString(),                // Enroll Date
        first_name + ' ' + last_name,               // Name
        first_name,                                 // First Name
        last_name,                                  // Last Name
        phone,                                      // Phone #
        date,                                       // Class Date
        '',                                         // Follow Up
        '',                                         // Prep MC
        '',                                         // Reminder MC
        '',                                         // Prep Instructions
        'No',                                       // Paid
        '$0',                                       // Amount
        marketing,                                  // Marketing,
        email,                                      // Email
        genPortalId(date, first_name, last_name),   // Portal UID
        '',                                         // Github Username
        'Not Invited',                              // Slack Status
        'Not Invited',                              // Portal Status
        'Not Invited',                              // Github Team
        'Not Created',                              // root prototypes
        'Not Created',                              // root portfolio
        'Not Created'                               // root mboutique
    ];
}

function genPortalId(date, fName, lName){
    return 'r' + dateToMonthYear(date) + '_' + fName[0].toLowerCase() + capitalize(lName);
}

function dateToMonthYear(date){
    const months = {
        'jan': 1,
        'january': 1,
        'feb': 2,
        'february': 2,
        'mar': 3,
        'march': 3,
        'apr': 4,
        'april': 4,
        'may': 5,
        'jun': 6,
        'june': 6,
        'jul': 7,
        'july': 7,
        'aug': 8,
        'august': 8,
        'sep': 9,
        'september': 9,
        'oct': 10,
        'october': 10,
        'nov': 11,
        'november': 11,
        'dec': 12,
        'december': 12
    }
    
    const dash = date.indexOf('-');
    
    if(dash > -1){
        date = date.slice(0, dash - 1);
    }
    
    const dateArr = date.toLowerCase().split(' ');
    
    return months[dateArr[0]] + dateArr[dateArr.length - 1].slice(2);
}

function capitalize(str){
    return str[0].toUpperCase() + str.slice(1);
}
