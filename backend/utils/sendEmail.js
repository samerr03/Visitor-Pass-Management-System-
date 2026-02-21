const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If SMTP is not properly configured, log to console for development
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials not found in environment variables. Falling back to dev mode:');
        console.log(`\n--- MOCK EMAIL TO: ${options.email} ---`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message:\n${options.message}`);
        console.log(`\nRESET LINK (click to verify):`);
        console.log(`>>> ${/http[s]?:\/\/[^\s]+/.exec(options.message)?.[0] || 'Link missing'} <<<\n`);
        return;
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Visitor Pass System'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
