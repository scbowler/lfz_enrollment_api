const fs = require('fs');
const google = require('googleapis');
const authorize = require('../services/google_auth');
const { spreadsheetId } = require('../config');
const { buildDataArray, buildSheetsObj, normalizeNames } = require('../helpers');
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

    const formData = normalizeNames(req.body);
    
    const sheet = formData.class_date;

    if(sheetExists(sheet, formData.formId)){
        saveStudent(auth, sheet, formData, res);
    } else {
        createNewSheet(auth, sheet, formData.formId).then(() => {
            saveStudent(auth, sheet, formData, res);
        });
    }   
}

function saveStudent(auth, sheet, formData, res){
    const body = {
        values: [ buildDataArray(formData) ]
    };

    const sheets = google.sheets('v4');

    getNextRowNumber(auth, sheet, spreadsheetId[formData.formId]).then( row => {
        sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheetId[formData.formId],
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
    }).catch( err => {
        res.send({success: false, error: 'Unable to get next row number'});
    });
}

function createNewSheet(auth, title, classId){

    return new Promise((resolve, reject) => {
        const templateId = getTemplateId(classId);
        const sheets = google.sheets('v4');

        sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId: spreadsheetId[classId],
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
            const saveResp = saveSheetInfoLocal(title, classId, sheetId);

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

function getNextRowNumber(auth, sheet, spreadsheetId){
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
    const classId = req.query.sheets;

    const sheets = google.sheets('v4');

    sheets.spreadsheets.get({
        auth,
        spreadsheetId: spreadsheetId[classId],
        fields: 'sheets(properties(sheetId,title))'
    }, (err, resp) => {
        if(err){
            return res.send({success: false, error: 'Failed getting sheets'});
        }

        const sheetsArr = buildSheetsObj(resp.sheets);

        writeToSheetsFile(classId, {sheets: sheetsArr});

        res.send({success: true, data: sheetsArr});
    });
}
