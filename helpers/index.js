
function buildSheetsObj(sheetsArr){
    const sheets = {};

    sheetsArr.map(sheet => sheets[sheet.properties.title] = {id: sheet.properties.sheetId});

    return sheets;
}

function buildDataArray(info){
    const { first_name, last_name, phone, email, class_date, marketing, formId, returning_student } = info;
    const sheet = class_date;
    
    switch(formId){
        case 'enroll-info-session':
            return [
                null,                                       // #
                first_name,                                 // First Name
                last_name,                                  // Last Name
                email,                                      // Email
                marketing,                                  // Marketing
                phone,                                      // Phone #
                new Date().toLocaleString(),                // Enroll Date
                getFromParentheses(class_date),             // In Person / Virtual
            ];
        case 'root-js':
        case 'root-level-1':
            return [
                null,                                       // #
                email,                                      // Email
                first_name + ' ' + last_name,               // Name
                first_name,                                 // First Name
                last_name,                                  // Last Name
                phone,                                      // Phone #
                class_date,                                 // Class Date
                new Date().toLocaleString(),                // Enroll Date
                '',                                         // Follow Up
                '',                                         // Prep MC
                '',                                         // Reminder MC
                '',                                         // Prep Instructions
                'No',                                       // Paid
                '$0',                                       // Amount
                marketing,                                  // Marketing
                genPortalId(
                    class_date, first_name, last_name, formId 
                ),                                          // Portal UID
                '',                                         // Github Username
                'Not Invited',                              // Slack Status
                'Not Invited',                              // Portal Status
                'Not Invited',                              // Github Team
                'Not Created',                              // root prototypes
                'Not Created',                              // root portfolio
                'Not Created'                               // root mboutique
            ];
        case 'react-101-register':
            return [
                null,                                       // #
                email,                                      // Email
                first_name + ' ' + last_name,               // Name
                first_name,                                 // First Name
                last_name,                                  // Last Name
                phone,                                      // Phone #
                class_date,                                 // Class Date
                new Date().toLocaleString(),                // Enroll Date
                '',                                         // Follow Up
                '',                                         // Prep MC
                '',                                         // Reminder MC
                '',                                         // Prep Instructions
                'No',                                       // Paid
                returning_student === 'true' ? 'Yes' : 'No',// Returning Student Discount
                '$0',                                       // Amount
                marketing,                                  // Marketing
                genPortalId(
                    class_date, first_name, last_name, formId
                ),                                          // Portal UID
                '',                                         // Github Username
                'Not Invited',                              // Slack Status
                'Not Invited',                              // Portal Status
                'Not Invited',                              // Github Team
            ];
        default:
            return [
                'Unknown',
                'Template',
                'Unknown',
                'Template',
                'Unknown',
                'Template',
                'Unknown',
                'Template'
            ]
    }
}

function genPortalId(date, fName, lName, type = 'r'){
    const classes = {
        'root-js': 'rjs',
        'root-level-1': 'r',
        'react-101-register': 'r101_'
    }
    return (classes[type] || type) + dateToMonthYear(date) + '_' + fName[0].toLowerCase() + capitalize(lName);
}

function dateToMonthYear(date){
    const months = {
        'jan': 1, 'january': 1,
        'feb': 2, 'february': 2,
        'mar': 3, 'march': 3,
        'apr': 4, 'april': 4,
        'may': 5,
        'jun': 6, 'june': 6,
        'jul': 7, 'july': 7,
        'aug': 8, 'august': 8,
        'sep': 9, 'september': 9,
        'oct': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'december': 12
    }
    
    const dash = date.indexOf('-');
    
    if(dash > -1){
        date = date.slice(0, dash - 1);
    }
    
    const dateArr = date.toLowerCase().split(' ');
    
    return months[dateArr[0]] + dateArr[dateArr.length - 1].slice(2);
}

function getFromParentheses(str){
    const result = /(\((.*)\))/g.exec(str);

    return result[result.length - 1] || 'Unknown';
}

function normalizeSheetName(name){
    const atIndex = name.indexOf('@');
  
    return name.substr(0, atIndex - 1) || name;
}

function normalizeNames(obj){
    const normalized = {};

    Object.keys(obj).map( key => {
        const keyArr = key.split('_');

        const inputtedIndex = keyArr.indexOf('inputted');

        if(inputtedIndex > -1){
            keyArr.splice(inputtedIndex, 1);
        }

        normalized[keyArr.join('_')] = obj[key];
    });

    return normalized;
}

function capitalize(str){
    return str[0].toUpperCase() + str.slice(1);
}

module.exports = {
    buildDataArray,
    buildSheetsObj,
    normalizeNames,
    normalizeSheetName
}
