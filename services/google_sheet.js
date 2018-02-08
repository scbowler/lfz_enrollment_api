const fs = require('fs');
const google = require('googleapis');
const authorize = require('../services/google_auth');
const { spreadsheet } = require('../config');
const sendEmail = require('../services/email');
const { buildDataArray, buildSheetsObj, normalizeNames, normalizeSheetName } = require('../helpers');
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
    
    const sheet = normalizeSheetName(formData.class_date);

    try{
        if(sheetExists(sheet, formData.formId)){
            saveStudent(auth, sheet, formData, res);
        } else {
            createNewSheet(auth, sheet, formData.formId).then(() => {
                saveStudent(auth, sheet, formData, res);
            }).catch(err => {
                if(err.msg){
                    return sendEmail(err);
                }
                
                sendEmail({
                    msg: 'Caught error in code. createBewSheet failed',
                    function: 'addStudent',
                    file: __filename,
                    error: err.message
                })
            });
        }   
    } catch(err){
        sendEmail({
            msg: 'Caught error in code',
            function: 'addStudent',
            file: __filename,
            error: err.message
        });
    }
}

function saveStudent(auth, sheet, formData, res){
    const body = {
        values: [ buildDataArray(formData) ]
    };

    const sheets = google.sheets('v4');

    getNextRowNumber(auth, sheet, spreadsheet[formData.formId].id).then( row => {
        sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheet[formData.formId].id,
            range: `${sheet}!A${row}`,
            valueInputOption: 'USER_ENTERED',
            resource: body
        }, function(err, result) {
            if(err) {
                sendEmail({
                    msg: 'Google API Error Updating Sheet', 
                    function: {
                        name: 'saveStudent',
                        paramsList: ['auth', 'sheet', 'formData', 'res'],
                        paramsValues: {
                            auth, sheet, formData, res: 'Intentionally not included here'
                        }
                    },
                    file: __filename,
                    error: err.message
                });
                return res.send({success: false, error: 'Unable to save data'});
            }
            
            res.send({success: true});
        });
    }).catch( err => {
        sendEmail(err);
    });
}

function createNewSheet(auth, title, classId){

    return new Promise((resolve, reject) => {
        const templateId = getTemplateId(classId);
        const sheets = google.sheets('v4');

        sheets.spreadsheets.batchUpdate({
            auth,
            spreadsheetId: spreadsheet[classId].id,
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
            if(err) return reject({
                msg: 'Google API Error Creating New Sheet', 
                function: {
                    name: 'createNewSheet',
                    paramsList: ['auth', 'title', 'classId'],
                    paramsValues: {
                        auth, title, classId
                    }
                },
                file: __filename,
                error: err.message
            });

            try{

                updateDataSheet(auth, spreadsheet[classId].id, title, spreadsheet[classId].dataLoc);

                const sheetId = resp.replies[0].duplicateSheet.properties.sheetId;
                const saveResp = saveSheetInfoLocal(title, classId, sheetId);
    
                resolve(true);
            } catch(err){
                sendEmail({
                    msg: 'Caught error in code',
                    function: 'createNewSheet',
                    file: __filename,
                    error: err.message
                });
            }
        });
    });
}

function updateDataSheet(auth, spreadsheetId, sheetName, loc){
    const body = {
        values: [
            [sheetName, `='${sheetName}'!${loc}`]
        ]
    };

    const sheets = google.sheets('v4');

    sheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'data!A1:b1',
        valueInputOption: 'USER_ENTERED',
        resource: body
    }, function(err, result){
        if(err){
            sendEmail({
                msg: 'GOOGLE API ERROR: Error updating data sheet for: ' + spreadsheetId + ' Sheet name:' + sheetName,
                function: 'updateDataSheet',
                file: __filename,
                error: err.message
            });
        }
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
                return reject({
                    msg: 'Google API Error', 
                    function: {
                        name: 'getNextRowNumber',
                        paramsList: ['auth', 'sheet', 'spreadsheetId'],
                        paramsValues: {
                            auth, sheet, spreadsheetId
                        }
                    },
                    file: __filename,
                    error: err.message
                });
            }
            try{
                const rows = response.values;
            
                if (rows.length == 0) {
                    return resolve(1);
                } 

                for(let i = 1; i < rows.length; i++){
                    const row = rows[i];
                    if(!row[1] && !row[2]){
                        
                        return resolve(i + 1);
                    }
                }
                return resolve(i + 1);
            } catch(err){
                reject({
                    msg: 'Caught code error',
                    function: 'getNextRowNumber',
                    file: __filename,
                    error: err.message
                });
            }
        });
    });
}

function syncSheetsFile(auth, req, res){
    const classId = req.query.sheets;

    const sheets = google.sheets('v4');

    sheets.spreadsheets.get({
        auth,
        spreadsheetId: spreadsheet[classId].id,
        fields: 'sheets(properties(sheetId,title))'
    }, (err, resp) => {
        if(err){
            return res.send({success: false, error: 'Failed getting sheets'});
        }

        const sheetsArr = buildSheetsObj(resp.sheets);

        writeToSheetsFile(classId, {sheets: sheetsArr}).catch( err => {
            sendEmail(err);
        });

        res.send({success: true, data: sheetsArr});
    });
}
