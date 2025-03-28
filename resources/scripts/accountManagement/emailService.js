import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        // user: 'your-email@gmail.com',
        //pass: 'your-email-password'
    }
});

export const sendVerificationEmail = async (email, token) => {
     // const verificationLink = `http://yourwebsite.com/api/verify?token=${token}`;

    const mailOptions = {
        from: 'no-reply@yourwebsite.com',
        to: email,
        subject: 'Verify Your Email',
        text: `Click the link below to verify your email:\n\n${verificationLink}`
    };

    return transporter.sendMail(mailOptions);
};
