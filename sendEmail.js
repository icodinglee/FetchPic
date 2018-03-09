const nodemailer = require('nodemailer');

 function sendEmail(){
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.126.com',
            port: 25,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'lihk11844@126.com', // generated ethereal user
                pass: 'smtp****123' // generated ethereal password
            }
        });
    
        // setup email data with unicode symbols
        let mailOptions = {
            from: 'lihk11844@126.com', // sender address
            to: 'lihk11844@126.com', // list of receivers
            subject: '抓取图片', // Subject line
            text: '抓取完毕！请查收', // plain text body
            html: '抓取完毕！请查收' ,// html body
            attachments: [
                {
                    filename: 'target.zip',
                    path: './target.zip'
                }
            ]
        };
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });
}

module.exports = sendEmail;
