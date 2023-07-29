const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Nikhil Satyam <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {

    if (process.env.NODE_ENV === 'production') {
      //sendGrid
      return 1;
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
    return transporter ;
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
    const text = convert(html,{
      wordwrap:130
    });
    // 2) DEFINE email OPTIONS
    const mailOptions = {
      from: 'Nikhil Satyam <nikhilsatyam@gmail.com>',
      to: this.to,
      subject,
      html,
      text,
    };

    // 3) CREATE TRANSPORT and SEND mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours!');
  }

  async sendPasswordReset(){
    await this.send('passwordReset','Your password reset token(valid for only 10 mins)')
  }
};
