const nodemailer = require('nodemailer');
const User = require('../models/User');

class Mailer {
  sendEmail({ username, password }) {
    return (async () => {
      const testAccount = await nodemailer.createTestAccount();

      let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      let containerStyles = `
        font-size: 18px;
      `;

      let buttonStyles = `
        background: #40AD7E;
        border-radius: 4px;
        border: none;
        color: #fff;
        display: block;
        font-size: 18px;
        font-weight: bold;
        padding: 10px;
        text-align: center;
        text-decoration: none;
        width: 200px;
      `;

      let htmlEmail = `
        <div style='${containerStyles}'>
          <p>Take a moment to reflect on your day.</p>
          <a href='https://whatbrentdo.com' style='${buttonStyles}'>log day</a>
        </div>
      `;

      let info = await transporter.sendMail({
        from: '"Gradient app" <hey@gradientapp.co>',
        to: 'brent.e.meyer@gmail.com',
        subject: 'How was your day?',
        text: 'Take a moment to reflect on your day at gradientapp.co',
        html: htmlEmail,
      });

      console.log(`Email sent: ${info.messageId}`);
      console.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
    })();
  }

  sendDailyEmail() {
    return (async (mailer) => {
      try {
        const users = await User.getAll();
        users.forEach(user => {
          mailer.sendEmail(user)
            .then(() => console.log(`email sent to ${user.username}`))
            .catch(err => console.log(err));
        });
      } catch (err) {
        console.log(err);
      }
    })(this);
  }
}

module.exports = new Mailer();
