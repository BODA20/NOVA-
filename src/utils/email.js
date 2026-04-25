const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = (user.name || '').split(' ')[0] || 'there';
    this.url = url;
    this.from = `NOVA Tour <${process.env.EMAIL_FROM || 'no-reply@novatour.com'}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Production: SendGrid SMTP
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

    // Development: Mailtrap or any SMTP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  buildHTML(subject, message, buttonText = 'Click Here') {
    return `
      <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">${subject}</h2>
        <p>Hi ${this.firstName},</p>
        <p>${message}</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${this.url}"
             style="display:inline-block; padding:12px 24px; text-decoration:none; background-color: #55c57a; color: #fff; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </p>
        <p style="color:#666; font-size:12px; border-top: 1px solid #eee; padding-top: 20px;">
          If you didn’t perform this action, you can safely ignore this email.
        </p>
      </div>
    `;
  }

  async send(subject, message, buttonText) {
    const transporter = this.newTransport();

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: `Hi ${this.firstName},\n\n${message}\n\nLink: ${this.url}\n`,
      html: this.buildHTML(subject, message, buttonText),
    };

    await transporter.sendMail(mailOptions);
  }

  async sendVerification() {
    await this.send(
      'Welcome to NOVA Tour! Please verify your account',
      'Please click the button below to verify your email address. This link is valid for 24 hours.',
      'Verify Email'
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset token (valid for 10 minutes)',
      'Click the button below to reset your password. If you didn’t request this, ignore this email.',
      'Reset Password'
    );
  }

  async sendEmailChangeVerification() {
    await this.send(
      'Confirm your new email address',
      'Please click the button below to confirm your new email address. This link is valid for 24 hours.',
      'Confirm Email'
    );
  }
};
