const pug = require("pug");
const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

// Email class
module.exports = class {
  constructor(user, url) {
    // MailTrap
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Shreyas Damgude <${process.env.EMAIL_FROM}>`;

    // MailerSend
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_TOKEN,
    });
    this.sentFrom = new Sender(process.env.MAILERSEND_USER, "Shreyas Damgude");
    this.recipient = [new Recipient(user.email, user.name)];
  }

  createNewTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,

      secure: process.env.EMAIL_PORT === 465 ? true : false,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // Render the HTML for the email
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    if (process.env.NODE_ENV === "production") {
      const emailParams = new EmailParams()
        .setFrom(this.sentFrom)
        .setTo(this.recipient)
        .setReplyTo(this.sentFrom)
        .setSubject(subject)
        .setHtml(html)
        .setText(htmlToText.convert(html));

      // Send email
      await this.mailerSend.email.send(emailParams);
    } else {
      // Define the email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html),
      };

      // Create transport and send email
      this.createNewTransport().sendMail(mailOptions);
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Natours Family");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
