const fs = require('fs');
const { resolve } = require('path');
const { spreadsheet } = require('../config');

function saveSheetInfoLocal(title, classId, sheetId){
    const filePath = spreadsheet[classId].path;

    if(filePath){
        const data = JSON.parse(fs.readFileSync(filePath));

        data.sheets[title] = sheetId;
    
        return fs.writeFileSync(filePath, JSON.stringify(data));
    }

    throw new Error(`Invalid file path - "${filePath}"`);
}

function sheetExists(title, classId){
    const filePath = spreadsheet[classId].path;

    if(filePath){
        if(fs.existsSync(filePath)){
            const { sheets } = JSON.parse(fs.readFileSync(filePath));

            return typeof sheets[title] !== 'undefined';
        }

        return 'sync-file';
    }

    throw new Error(`Invalid file path - "${filePath}"`);
}

function writeToSheetsFile(classId, data){

    return new Promise((resolve, reject) => {

        const filePath = spreadsheet[classId].path;

        if(filePath){
            fs.writeFile(filePath, JSON.stringify(data), err => {
                if(err) return reject({
                    msg: 'Error: Writing to file',
                    function: {
                        name: 'writeToSheetsFile',
                        paramsList: ['classId', 'data'],
                        paramsValues: { classId, data }
                    },
                    file: __filename,
                    error: err.message
                });
    
                resolve({success: true});
            });
        } else {
            reject({
                msg: 'Error: Invalid file path',
                function: {
                    name: 'writeToSheetsFile',
                    paramsList: ['classId', 'data'],
                    paramsValues: { classId, data }
                },
                file: __filename,
                error: `Invalid file path - "${filePath}"`
            });
        }        
    });
}

function getTemplateId(classId, templateName = 'template'){
    const filePath = spreadsheet[classId].path;

    if(filePath){
        const { sheets } = JSON.parse(fs.readFileSync(filePath));
        const template = sheets[templateName];

        return template ? template.id : false;
    }

    throw new Error(`Invalid file path - "${filePath}"`);
}

function getSheetsList(classId){
    const filePath = spreadsheet[classId].path;

    if(filePath){
        if(fs.existsSync(filePath)){
            const { sheets } = JSON.parse(fs.readFileSync(filePath));

            return sheets;
        }
        return {'Missing File - Sync Course': true};
    }

    throw new Error(`Invalid file path = "${filePath}"`);
}

module.exports = {
    sheetExists,
    getTemplateId,
    writeToSheetsFile,
    saveSheetInfoLocal,
    getSheetsList
}
