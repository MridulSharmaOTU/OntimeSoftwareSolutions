import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'myvideogamelist.rickotu@gmail.com',
    pass: 'oltb zjfj xmpb seur'
  },

  port: 465,
  secure: true
});

export const sendVerificationEmail = async (email, token) => {
  // Construct a verification link pointing to your verification endpoint.
  // For example, if your server runs on localhost:3000 and your endpoint is /api/verify:
  const verificationLink = `http://localhost:3000/api/verify?token=${token}`;

  const mailOptions = {
    from: 'myvideogamelist.rickotu@gmail.com',
    to: email,
    subject: 'Verify Your Email to Complete Registration for MyVideoGameList',
    html: `<p>Click the link below to verify your email:</p><p><a href="${verificationLink}">Verify Email</a></p>`,
  };

  return transporter.sendMail(mailOptions);
};