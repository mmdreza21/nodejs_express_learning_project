const nodemailer = require('nodemailer');



let transport = nodemailer.createTransport({
    host:'',
    port:'',
    secure: false, // true for 465, false for other ports
   
});


module.exports = transport