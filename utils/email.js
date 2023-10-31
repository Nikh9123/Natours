const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
// const transport = require('nodemailer-brevo-transport');
const pug = require('pug');
// const rese = require('rese');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Nikhil Satyam <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Real time email sending service from gmail
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
  
      });
      transporter.verify((err) => {
        if (err) console.error(err);
      });
      return transporter;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    transporter.verify((err) => {
      if (err) console.error(err);
    });
    return transporter;
    //send testing email from mailsac Transporter service
  }

  //* SENDS the actual mail
  async send(template, subject) {
    // 1) RENDER HTML based on a pug TEMPLATE
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const text = convert(html, {
      wordwrap: 130,
    });
    // 2) DEFINE email OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    // 3) CREATE TRANSPORT and SEND mail
    try{
      await this.newTransport().sendMail(mailOptions);
    }
    catch(err){
      console.log(err)
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token(valid for only 10 mins)'
    );
  }
};
