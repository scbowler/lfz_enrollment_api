const fs = require('fs');
const google = require('googleapis');
const authorize = require('../services/google_auth');
const { spreadsheetId } = require('../config');
const { buildDataArray, buildSheetsObj } = require('../helpers');
const { 
    sheetExists,
    getTemplateId,
    writeToSheetsFile,
    saveSheetInfoLocal 
} = require('../helpers/file_ops');

exports.sendData = function(req, res){
    authorize(req, res, addStudent);
}

exports.getData = function(req, res){
    authorize(req, res, getClassList);
}

exports.syncSheets = function(req, res){
    authorize(req, res, syncSheetsFile);
}

function addStudent(auth, req, res){

    console.log('Data Array:', req.body);

    return res.send({msg: 'Testing in progress'});
    
    const sheet = req.body.date;

    if(sheetExists(sheet)){
        saveStudent(auth, sheet, req, res);
    } else {
        createNewSheet(auth, sheet).then(() => {
            saveStudent(auth, sheet, req, res);
        });
    }   
}

function saveStudent(auth, sheet, req, res){
    const body = {
        values: [ buildDataArray(req.body) ]
    };

    console.log('Data Array:', body);

    return res.send({msg: 'Testing in progress'});

    const sheets = google.sheets('v4');

    getNextRowNumber(auth, sheet).then( row => {
        sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: `${sheet}!A${row}`,
            valueInputOption: 'USER_ENTERED',
            resource: body
        }, function(err, result) {
            if(err) {
                res.send({success: false, error: 'Unable to save data'});
            } else {
                res.send({success: true});
            }
        });
    });
}

function createNewSheet(auth, title){

    return new Promise((resolve, reject) => {
        const templateId = getTemplateId();
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
            if(err) return reject(err);

            const sheetId = resp.replies[0].duplicateSheet.properties.sheetId;
            const saveResp = saveSheetInfoLocal(title, sheetId);

            resolve(true);
        });
    });
}

function getClassList(auth, req, res) {
    const sheets = google.sheets('v4');

    const sheet = req.body.class;

    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: `${sheet}!A1:H`,
    }, function(err, response) {
        if (err) {
            res.send({success: false, error: 'Google API Error'});
            return;
        }
        const rows = response.values;
        if (rows.length == 0) {
            res.send({success: false, error: 'No Data Found'});
        } else {
            res.send({success: true, rows});
        }
    });
}

function getNextRowNumber(auth, sheet){
    const sheets = google.sheets('v4');

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: `${sheet}!A1:C`,
        }, function(err, response) {
            if (err) {
                reject({success: false, error: 'Google API Error'});
            }
            const rows = response.values;
            
            if (rows.length == 0) {
                resolve(1);
            } else {
                for(let i = 1; i < rows.length; i++){
                    const row = rows[i];
                    if(!row[1] && !row[2]){
                        
                        return resolve(i + 1);
                    }
                }
                return resolve(i + 1);
            }
        });
    });
}

function syncSheetsFile(auth, req, res){
    const sheets = google.sheets('v4');

    sheets.spreadsheets.get({
        auth,
        spreadsheetId,
        fields: 'sheets(properties(sheetId,title))'
    }, (err, resp) => {
        if(err){
            return res.send({success: false, error: 'Failed getting sheets'});
        }

        const sheetsArr = buildSheetsObj(resp.sheets);

        writeToSheetsFile({sheets: sheetsArr});

        res.send({success: true, data: sheetsArr});
    });
}
