const ENV = process.env.ENV || 'dev';
let config = {};

const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';

if(ENV === 'dev'){
    config = {
        SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
        TOKEN_DIR,
        TOKEN_PATH: TOKEN_DIR + 'sheets.googleapis.com-nodejs.json',
        spreadsheetId = '1SY3S6V8TXtcC5FxwF9iUvNmpgO_vek2Q-n-5ryBiTIo'
    }
}

module.exports = config;
