const fs = require('fs');
const { resolve } = require('path');

const sheetsFilePath = {
    'root-level-1': resolve(__dirname, '..', 'data', 'root_1_sheets.json'),
    'root-js': resolve(__dirname, '..', 'data', 'root_js_sheets.json')
}

function saveSheetInfoLocal(title, classId, sheetId){
    const filePath = sheetsFilePath[classId];
    const data = JSON.parse(fs.readFileSync(filePath));

    data.sheets[title] = sheetId;

    return fs.writeFileSync(filePath, JSON.stringify(data));
}

function sheetExists(title, classId){
    const { sheets } = JSON.parse(fs.readFileSync(sheetsFilePath[classId]));
                
    return typeof sheets[title] !== 'undefined';
}

function writeToSheetsFile(classId, data){

    return new Promise((resolve, reject) => {

        const filePath = sheetsFilePath[classId];

        if(filePath){
            fs.writeFile(filePath, JSON.stringify(data), err => {
                if(err) return reject({success: false, error: err});
    
                resolve({success: true});
            });
        } else {
            reject({success: false, error: 'Unknown Spreadsheet ID'});
        }        
    });
}

function getTemplateId(classId, templateName = 'template'){
    const filePath = sheetsFilePath[classId];

    if(filePath){
        const { sheets } = JSON.parse(fs.readFileSync(filePath));
        const template = sheets[templateName];

        return template ? template.id : false;
    }

    return false;
}

module.exports = {
    sheetExists,
    getTemplateId,
    writeToSheetsFile,
    saveSheetInfoLocal
}
