import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface DocUpdateEmailData {
  to: string;
  repoName: string;
  summary: string;
  diffPreview: string;
  coverageScore: number;
  patches: Array<{ file: string; reason: string }>;
  issues?: string[];
  prUrl?: string;
  jobId?: string;
}

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail(data: EmailData): Promise<void> {
    try {
      logger.info("Sending email with Resend", {
        to: data.to,
        subject: data.subject,
        hasApiKey: !!env.RESEND_API_KEY,
      });

      const result = await this.resend.emails.send({
        from: "Docr <onboarding@resend.dev>",
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });

      // Log full email send result
      logger.info("Email sent successfully", {
        to: data.to,
        subject: data.subject,
        messageId: (result as any).id,
        fullResult: JSON.stringify(result),
      });
    } catch (error) {
      logger.error("Failed to send email", {
        to: data.to,
        error: error.message,
        errorDetails: error,
      });
      throw error;
    }
  }

  async sendDocUpdateEmail(data: DocUpdateEmailData): Promise<void> {
    const html = this.buildDocUpdateEmail(data);
    await this.sendEmail({
      to: data.to,
      subject: `Documentation Updated: ${data.repoName}`,
      html,
      text: this.buildDocUpdateEmailText(data),
    });
  }

  async sendErrorNotification(
    to: string,
    repoName: string,
    error: string,
    jobId?: string
  ): Promise<void> {
    const html = `
      <h2>Documentation Update Failed</h2>
      <p>We encountered an error while updating documentation for <strong>${repoName}</strong>.</p>
      <p><strong>Error:</strong> ${error}</p>
      ${jobId ? `<p><strong>Job ID:</strong> ${jobId}</p>` : ""}
      <p>Please check your repository settings or contact support if this persists.</p>
    `;

    await this.sendEmail({
      to,
      subject: `Documentation Update Failed: ${repoName}`,
      html,
    });
  }

  async sendLowCreditsWarning(to: string, balance: number): Promise<void> {
    const html = `
      <h2>Low Credits Warning</h2>
      <p>Your Docr account is running low on credits.</p>
      <p><strong>Current Balance:</strong> ${balance}</p>
      <p>Please top up your account to continue using Docr's documentation features.</p>
    `;

    await this.sendEmail({
      to,
      subject: "Low Credits Warning - Docr",
      html,
    });
  }

  private buildDocUpdateEmail(data: DocUpdateEmailData): string {
    const coverageColor =
      data.coverageScore >= 0.8
        ? "green"
        : data.coverageScore >= 0.5
        ? "orange"
        : "red";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1F2937; background: #F3F4F6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .header p { margin: 8px 0 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { margin: 0 0 12px 0; font-size: 18px; color: #1F2937; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; }
            .score-box { display: inline-block; padding: 8px 16px; border-radius: 6px; color: white; background: ${coverageColor}; font-weight: 600; }
            .patch { background: #F9FAFB; padding: 12px; margin: 10px 0; border-left: 4px solid #4F46E5; border-radius: 4px; }
            .patch-title { font-weight: 600; color: #1F2937; }
            .patch-reason { color: #6B7280; font-size: 14px; margin: 4px 0 0 0; }
            .footer { background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280; }
            .footer a { color: #4F46E5; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="wrapper">
              <div class="header">
                <h1>📚 Documentation Updated</h1>
                <p>Your repository documentation has been automatically updated by Docr</p>
              </div>
              <div class="content">
                <div class="section">
                  <h2>${data.repoName}</h2>
                  <p>${data.summary}</p>
                </div>
                
                <div class="section">
                  <h2>Coverage Score</h2>
                  <span class="score-box">${(data.coverageScore * 100).toFixed(
                    0
                  )}%</span>
                </div>
                
                <div class="section">
                  <h2>Updated Files</h2>
                  ${data.patches
                    .map(
                      (p) => `
                    <div class="patch">
                      <div class="patch-title">📄 ${p.file}</div>
                      <div class="patch-reason">${p.reason}</div>
                    </div>
                  `
                    )
                    .join("")}
                </div>

                <div class="section">
                  <h2>Diff Preview</h2>
                  <pre style="white-space:pre-wrap;background:#F3F4F6;padding:12px;border-radius:8px;border:1px solid #E5E7EB;">${
                    data.diffPreview || "(no preview)"
                  }</pre>
                </div>
                
                ${
                  data.issues && data.issues.length > 0
                    ? `
                  <div class="section">
                    <h2>⚠️ Potential Issues</h2>
                    ${data.issues
                      .map(
                        (issue) => `<p style="color: #D97706;">• ${issue}</p>`
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
                ${
                  data.prUrl
                    ? `
                <div class="section">
                  <h2>Pull Request</h2>
                  <p><a href="${data.prUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;">View Pull Request</a></p>
                  <p style="color:#6B7280;font-size:13px;margin-top:8px;">The changes were created on a branch — review and merge the PR to apply to your default branch.</p>
                </div>
                `
                    : ""
                }
                ${
                  data.jobId
                    ? `
                <div class="section">
                  <h2>Job Details</h2>
                  <p>Job ID: <code>${data.jobId}</code></p>
                  <p style="margin-top:8px;"><a href="${
                    process.env.APP_URL || "https://app.docr.local"
                  }/app/job/${
                        data.jobId
                      }" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#10B981;color:#fff;text-decoration:none;">View Job Details</a></p>
                </div>
                `
                    : ""
                }
              </div>
              <div class="footer">
                <p>This documentation was automatically generated by <strong>Docr</strong></p>
                <p>Keep your documentation up-to-date with every commit</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private buildDocUpdateEmailText(data: DocUpdateEmailData): string {
    return `
Documentation Updated: ${data.repoName}

${data.summary}

Coverage Score: ${(data.coverageScore * 100).toFixed(0)}%

Updated Files:
${data.patches.map((p) => `- ${p.file}: ${p.reason}`).join("\n")}

${
  data.issues && data.issues.length > 0
    ? `\nPotential Issues:\n${data.issues.map((i) => `- ${i}`).join("\n")}`
    : ""
}
${data.prUrl ? `\nPull Request: ${data.prUrl}\n` : ""}
    `.trim();
  }
}

export const emailService = new EmailService();
