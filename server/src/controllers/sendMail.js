const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, html = null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS   
            }
        });

        const mailOptions = {
            from: `"ReelVault" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
        };

        if (html) {
            mailOptions.html = html;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        
        return {
            success: true,
            messageId: info.messageId
        };
    } 
    catch (error) 
    {
        console.error("Error sending email:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

const sendOTPEmail= async (to, otp,name) => {
    const subject = "Your OTP for REELVAULT";
    const text = `Your OTP for REELVAULT is: ${otp}. It is valid for 10 minutes.`;
    const html = `
    <h1>Hello ${name},</h1>
      <h2>Your OTP for REELVAULT</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    return await sendMail(to, subject, text, html);
};

module.exports = { sendMail, sendOTPEmail };