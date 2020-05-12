const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
        case 'enroll-info-session-full-immersion-remote':
        case 'enroll-part-time-info-session-oc':
        case 'enroll-ui-ux-info-session':
            return [
                null,                                       // #
                first_name,                                 // First Name
                last_name,                                  // Last Name
                email,                                      // Email
                marketing,                                  // Marketing
                phone,                                      // Phone #
                new Date().toLocaleString(),                // Enroll Date
                getFromParentheses(class_date),             // Full Immersion / Part Time
                'No',                                       // Attended
                'New'                                       // Status
            ];
        case 'enroll-part-time-info-session-sd':
            return [
                null,                                       // #
                first_name,                                 // First Name
                last_name,                                  // Last Name
                email,                                      // Email
                marketing,                                  // Marketing
                phone,                                      // Phone #
                new Date().toLocaleString(),                // Enroll Date
                class_date,                                 // Form Type
                'New'                                       // Status
            ];
        case 'free-bootcamp-guide':
            return [
                null,                                       // #
                first_name,                                 // First Name
                last_name,                                  // Last Name
                email,                                      // Email
                new Date().toLocaleString(),                // Date Added
                'NO'                                        // Added to Mail List
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
                'New - Action Required',                    // Status
                '',                                         // Follow Up
                '',                                         // Prep MC
                '',                                         // Reminder MC
                '',                                         // Prep Instructions
                'No',                                       // Paid
                null,                                       // Amount
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
                'New - Action Required',                    // Status
                '',                                         // Follow Up
                '',                                         // Prep MC
                '',                                         // Reminder MC
                '',                                         // Prep Instructions
                'No',                                       // Paid
                returning_student === 'true' ? 'Yes' : 'No',// Returning Student Discount
                null,                                       // Amount
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

function getFromParentheses(str, fallBack = 'Unknown'){
    const result = /(\((.*)\))/g.exec(str);

    return result ? result[result.length - 1] : fallBack;
}

function genSheetName() {
    const today = new Date();

    return `${monthsShort[today.getMonth()]} ${today.getFullYear()}`;
}

function normalizeSheetName(name) {
    if(!name) {
        return genSheetName();
    }
    
    const atIndex = name.indexOf('@');
    const inParens = /\((.*)\-/g.exec(name);
    let additionalInfo = '';

    if (inParens) {
        additionalInfo = ` - ${inParens[inParens.length - 1]}`;
    }

    return ((name.substr(0, atIndex - 1) || name) + additionalInfo).trim();
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

function cleanRowData(rows){
    const cleanRows = [];
    const length = rows.length;
    let done = false;
    let index = 0;

    while(!done && index < length){
        if(rows[index].length > 0){
            cleanRows.push(rows[index]);
            index++;
            continue;
        }

        done = true;
    }
    return cleanRows;
}

function capitalize(str){
    return str[0].toUpperCase() + str.slice(1);
}

module.exports = {
    buildDataArray,
    buildSheetsObj,
    normalizeNames,
    normalizeSheetName,
    cleanRowData
}
