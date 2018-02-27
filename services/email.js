const nodemailer = require('nodemailer');
const { EMAIL } = require('../config');
const ENV = process.env.ENV || 'production';

module.exports = message => {

    message.timestamp = new Date().toLocaleString();

    const errorString = JSON.stringify(message, null, '\t');

    const messageText = `The following error ocurred when adding a student to the Enrolment spreadsheet \n\n ${errorString}`;

    const messageHtml = `
        <h1 style="color: red">AN ERROR OCURRED</h1>
        <h3><span style="color: red">ERROR:</span> Saving student to enrollment spreadsheet</h3>
        <br>
        <h2>DETAILS:</h2>
        <pre style="font-size: 1.2rem">${errorString}</pre>
        <br>
    `;


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: EMAIL.username,
            pass: EMAIL.password
        }
    });
    
    const mailOptions = {
        from: EMAIL.from,
        to: EMAIL.to,
        subject: `Error saving student to enrollment spreadsheet - From: ${ENV}`,
        text: messageText,
        html: messageHtml
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) return console.log('Failed to send email', err);
    });
}
