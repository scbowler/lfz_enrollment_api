const { google } = require('googleapis');
const authorize = require('../services/google_auth');
const { spreadsheet } = require('../config');
const sendEmail = require('../services/email');
const { 
    buildDataArray,
    buildSheetsObj,
    normalizeNames,
    normalizeSheetName,
    cleanRowData
} = require('../helpers');
const { 
    sheetExists,
    getTemplateId,
    writeToSheetsFile,
    saveSheetInfoLocal,
    getSheetsList
} = require('../helpers/file_ops');

exports.sendData = function(req, res){
    authorize(req, res, addStudent);
}

exports.getRoster = function(req, res){
    authorize(req, res, getCourseRoster);
}

exports.syncSheets = function(req, res){
    authorize(req, res, syncSheetsFile);
}

exports.getClassList = function(req, res) {
    const returnData = {};

    Object.keys(spreadsheet).map( (classId, index) => {
        returnData[classId] = getSheetsList(classId);
    });

    res.send({classList: returnData});
}

exports.attendance = function(req, res){
    authorize(req, res, updateAttended);
}

function addStudent(auth, req, res){

    const formData = normalizeNames(req.body);  
    
    const sheet = normalizeSheetName(formData.class_date);

    try{
        const exists = sheetExists(sheet, formData.formId);

        if(exists === 'sync-file'){
            syncSheetsFile(auth, null, null, {
                classId: formData.formId,
                callBack: () => addStudent(auth, req, res)
            });
        }else if(exists){
            saveStudent(auth, sheet, formData, res);
        } else {
            createNewSheet(auth, sheet, formData.formId).then(() => {
                saveStudent(auth, sheet, formData, res);
            }).catch(err => {
                if(err.msg){
                    res.send({ success: false });
                    return sendEmail(err);
                }
                
                sendEmail({
                    msg: 'Caught error in code. createNewSheet failed',
                    function: 'addStudent',
                    file: __filename,
                    error: err.message
                });
                res.send({success: false});
            });
        }   
    } catch(err){
        sendEmail({
            msg: 'Caught error in code',
            function: 'addStudent',
            file: __filename,
            error: err.message
        });
        res.send({ success: false });
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

function updateAttended(auth, req, res){
    const { value, index, roster: { courseId, rosterId }} = req.body;

    const body = {
        values: [[value]]
    };

    const sheets = google.sheets('v4');

    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: spreadsheet[courseId].id,
        range: `${rosterId}!I${index + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: body
    }, function (err, result) {
        if (err) {
            console.error('Error:', err.message);
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
            return res.send({ success: false, error: 'Unable to save data' });
        }

        res.send({ success: true });
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

                const sheetId = resp.data.replies[0].duplicateSheet.properties.sheetId;
                saveSheetInfoLocal(title, classId, sheetId);
    
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

function getCourseRoster(auth, req, res) {
    const sheets = google.sheets('v4');

    const {courseId, rosterId } = req.body;

    const range = courseId === 'enroll-info-session' ? `${rosterId}!B2:I` : `${rosterId}!B2:H`;

    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheet[courseId].id,
        range: range,
    }, function(err, response) {
        if (err) {
            res.send({success: false, error: 'Google API Error'});
            return;
        }
        
        let rows = response.data.values;
        if (rows.length == 0) {
            res.send({success: false, error: 'No Data Found'});
        } else {
            rows = cleanRowData(rows);
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
                const rows = response.data.values;
            
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

function syncSheetsFile(auth, req, res, useCallBack){
    const actions = {}

    if(useCallBack){
        actions.classId = useCallBack.classId;
        actions.success = useCallBack.callBack;
        actions.failure = () => { throw new Error('syncSheetsFile error') } ;
    } else if(req && res) {
        actions.classId = req.query.sheets;
        actions.success = resp => res.send(resp);
        actions.failure = actions.success;
    } else {
        throw new Error('Invalid arguments passed to syncSheetsFile');
    }

    const sheets = google.sheets('v4');

    sheets.spreadsheets.get({
        auth,
        spreadsheetId: spreadsheet[actions.classId].id,
        fields: 'sheets(properties(sheetId,title))'
    }, (err, resp) => {
        if(err){
            return actions.failure({success: false, error: 'Failed getting sheets'});
        }

        const sheetsArr = buildSheetsObj(resp.data.sheets);

        writeToSheetsFile(actions.classId, {sheets: sheetsArr}).then(resp => {
            actions.success({ success: true, data: sheetsArr });
        }).catch( err => {
            sendEmail(err);
        });
    });
}
