import * as brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email configuration interface
 */
export interface EmailConfig {
  recipients: string | string[]; // Single email or array of emails
  subject: string;
  body: string; // HTML content
  senderName?: string;
  senderEmail?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: Array<{
    name: string;
    content: string; // Base64 encoded content
    contentId?: string;
  }>;
}

/**
 * Generic email sender service using Brevo
 */
export class EmailService {
  private static emailAPI: brevo.TransactionalEmailsApi | null = null;
  private static isInitialized: boolean = false;

  /**
   * Initialize Brevo API client
   */
  private static initialize(): void {
    if (!this.isInitialized) {
      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        throw new Error('BREVO_API_KEY is not set in environment variables');
      }

      this.emailAPI = new brevo.TransactionalEmailsApi();
      // Set API key for authentication
      this.emailAPI.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
      this.isInitialized = true;
    }
  }

  /**
   * Send an email using Brevo
   * @param config Email configuration object
   * @returns Promise with the response from Brevo API
   */
  static async sendEmail(config: EmailConfig): Promise<any> {
    try {
      this.initialize();

      if (!this.emailAPI) {
        throw new Error('Email API not initialized');
      }

      const senderEmail = config.senderEmail || process.env.BREVO_SENDER_EMAIL || 'noreply@edubaseease.com';
      const senderName = config.senderName || process.env.BREVO_SENDER_NAME || 'EduBaseEase System';

      // Normalize recipients to array format
      const recipients = Array.isArray(config.recipients) ? config.recipients : [config.recipients];

      // Convert recipients array to Brevo format
      const to = recipients.map(email => ({ email, name: email.split('@')[0] }));

      // Create email message
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { name: senderName, email: senderEmail };
      sendSmtpEmail.to = to;
      sendSmtpEmail.subject = config.subject;
      sendSmtpEmail.htmlContent = config.body;

      // Add CC if provided
      if (config.cc && config.cc.length > 0) {
        sendSmtpEmail.cc = config.cc.map(email => ({ email, name: email.split('@')[0] }));
      }

      // Add BCC if provided
      if (config.bcc && config.bcc.length > 0) {
        sendSmtpEmail.bcc = config.bcc.map(email => ({ email, name: email.split('@')[0] }));
      }

      // Add reply-to if provided
      if (config.replyTo) {
        sendSmtpEmail.replyTo = { email: config.replyTo, name: config.replyTo.split('@')[0] };
      }

      // Add attachments if provided
      if (config.attachments && config.attachments.length > 0) {
        sendSmtpEmail.attachment = config.attachments.map(att => ({
          name: att.name,
          content: att.content,
          contentId: att.contentId
        }));
      }

      // Send email
      if (!this.emailAPI) {
        throw new Error('Email API not initialized');
      }
      const response = await this.emailAPI.sendTransacEmail(sendSmtpEmail);
      // console.log('Email sent successfully:', response);
      return response;
    } catch (error: any) {
      // console.error('Error sending email:', error);
      // if (error.response) {
      //   console.error('Error response:', error.response.body);
      // }
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Send a plain text email (converts to HTML)
   * @param config Email configuration (body will be treated as plain text)
   * @returns Promise with the response from Brevo API
   */
  static async sendPlainTextEmail(config: Omit<EmailConfig, 'body'> & { body: string }): Promise<any> {
    // Convert plain text to HTML
    const htmlBody = config.body
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('');

    return this.sendEmail({
      ...config,
      body: `<html><body>${htmlBody}</body></html>`
    });
  }
}

/**
 * Helper function to safely format numbers with 2 decimal places
 */
function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '0.00';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '0.00';
  }
  return numValue.toFixed(2);
}

/**
 * Email template builder for different email types
 */
export class EmailTemplates {

  /**
   * Generate HTML template for password reset code
   */
  static passwordResetCode(code: string, userName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: rgb(91, 46, 212); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p style="font-size: 16px;">
            ${userName ? `Hello ${userName},` : 'Hello,'}
          </p>
          <p>You have requested to reset your password. Please use the following code to reset your password:</p>
          
          <div style="background-color: white; padding: 30px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: rgb(91, 46, 212); letter-spacing: 5px;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px;">
            This is an automated notification from EduBaseEase System.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for verification code
   */
  static verificationCode(code: string, userName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Email Verification</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p style="font-size: 16px;">
            ${userName ? `Hello ${userName},` : 'Hello,'}
          </p>
          <p>Please use the following verification code to verify your email address:</p>
          
          <div style="background-color: white; padding: 30px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #2196F3; letter-spacing: 5px;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This code will expire in 10 minutes. If you did not request this verification, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px;">
            This is an automated notification from EduBaseEase System.
          </p>
        </div>
      </body>
      </html>
    `;
  }

}

