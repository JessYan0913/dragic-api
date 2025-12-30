import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { MailOptions, MailTemplate } from './interfaces/mail.interface';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * 发送邮件
   * @param options 邮件选项
   */
  async sendMail(options: MailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('邮件发送成功:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('邮件发送失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 发送文本邮件
   */
  async sendText(to: string, subject: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMail({ to, subject, text });
  }

  /**
   * 发送 HTML 邮件
   */
  async sendHtml(to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMail({ to, subject, html });
  }

  /**
   * 发送模板邮件
   * @param to 收件人
   * @param template 邮件模板对象
   * @param data 模板数据
   */
  async sendTemplate(to: string, template: MailTemplate, data: Record<string, any>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // 简单的模板替换，可以扩展为更复杂的模板引擎
    let html = template.html;
    let text = template.text;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, String(value));
      if (text) {
        text = text.replace(regex, String(value));
      }
    }

    return this.sendMail({ 
      to, 
      subject: template.subject, 
      html, 
      text 
    });
  }

  /**
   * 批量发送模板邮件
   * @param recipients 收件人列表
   * @param template 邮件模板对象
   * @param dataList 模板数据列表（与收件人一一对应）
   */
  async sendBatchTemplate(
    recipients: string[], 
    template: MailTemplate, 
    dataList: Record<string, any>[]
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string; to: string }>> {
    const results = [];
    
    for (let i = 0; i < recipients.length; i++) {
      const result = await this.sendTemplate(recipients[i], template, dataList[i] || {});
      results.push({ ...result, to: recipients[i] });
    }
    
    return results;
  }

  /**
   * 验证邮件配置
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP 连接验证成功');
      return true;
    } catch (error) {
      console.error('SMTP 连接验证失败:', error);
      return false;
    }
  }
}