import { Inject, Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { MAIL_CONFIG } from '../mail.constants';
import { MailConfig, MailOptions } from '../interfaces/mail.interface';
import { MailProvider } from './mail.provider';

@Injectable()
export class SmtpMailProvider implements MailProvider {
  private transporter: Transporter;

  constructor(@Inject(MAIL_CONFIG) private readonly config: MailConfig) {
    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
    });
  }

  async sendMail(options: MailOptions): Promise<string> {
    const mailOptions = {
      from: options.from || this.config.from || this.config.auth.user,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await this.transporter.sendMail(mailOptions);
    return info.messageId;
  }

  async verifyConnection(): Promise<boolean> {
    await this.transporter.verify();
    return true;
  }
}
