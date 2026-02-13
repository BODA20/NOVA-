const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = (user.name || '').split(' ')[0] || 'there';
    this.url = url;
    this.from = `NOVA Tour <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Production: SendGrid SMTP
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    // Development: Mailtrap (or any SMTP)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      // secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Basic HTML template (simple + safe)
  buildHTML(subject, message) {
    return `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>${subject}</h2>
        <p>Hi ${this.firstName},</p>
        <p>${message}</p>
        <p>
          <a href="${this.url}"
             style="display:inline-block;padding:10px 14px;text-decoration:none;border:1px solid #333;border-radius:6px">
            Verify your email
          </a>
        </p>
        <p style="color:#666;font-size:12px">
          If you didn’t create an account, you can ignore this email.
        </p>
      </div>
    `;
  }

  async send(subject, message) {
    const transporter = this.newTransport();

    if (process.env.EMAIL_DEBUG === 'true') {
      await transporter.verify();
    }

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: `Hi ${this.firstName},\n\n${message}\n\n${this.url}\n`,
      html: this.buildHTML(subject, message),
    };

    await transporter.sendMail(mailOptions);
  }

  async sendVerification() {
    await this.send(
      'Welcome to NOVA Tour! Please verify your account',
      'Please click the button below to verify your email address. This link is valid for 24 hours.',
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset token (valid for 10 minutes)',
      'Click the button below to reset your password. If you didn’t request this, ignore this email.',
    );
  }

  async sendEmailChangeVerification() {
    await this.send(
      'Confirm your new email address',
      'Please click the button below to confirm your new email address. This link is valid for 24 hours.',
    );
  }
};
