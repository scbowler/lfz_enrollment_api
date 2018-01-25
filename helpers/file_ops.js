const fs = require('fs');
const { resolve } = require('path');

const sheetsFilePath = resolve(__dirname, '..', 'data', 'sheets.json');

function saveSheetInfoLocal(title, id){
    const data = JSON.parse(fs.readFileSync(sheetsFilePath));

    data.sheets[title] = id;

    return fs.writeFileSync(sheetsFilePath, JSON.stringify(data));
}

function sheetExists(title){
    const { sheets } = JSON.parse(fs.readFileSync(sheetsFilePath));
                
    return typeof sheets[title] !== 'undefined';
}

function writeToSheetsFile(data, cb){

    return new Promise((resolve, reject) => {
        fs.writeFile(sheetsFilePath, JSON.stringify(data), err => {
            if(err) return reject({success: false, error: err});

            resolve({success: true});
        });
    });
}

function getTemplateId(templateName = 'template'){
    const { sheets } = JSON.parse(fs.readFileSync(sheetsFilePath));
    const template = sheets[templateName];

    return template ? template.id : false;
}

module.exports = {
    sheetExists,
    getTemplateId,
    writeToSheetsFile,
    saveSheetInfoLocal
}
