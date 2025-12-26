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
    patches: Array<{
        file: string;
        reason: string;
    }>;
    issues?: string[];
    prUrl?: string;
    jobId?: string;
}
export declare class EmailService {
    private resend;
    constructor();
    sendEmail(data: EmailData): Promise<void>;
    sendDocUpdateEmail(data: DocUpdateEmailData): Promise<void>;
    sendErrorNotification(to: string, repoName: string, error: string, jobId?: string): Promise<void>;
    sendLowCreditsWarning(to: string, balance: number): Promise<void>;
    private buildDocUpdateEmail;
    private buildDocUpdateEmailText;
}
export declare const emailService: EmailService;
//# sourceMappingURL=email.service.d.ts.map