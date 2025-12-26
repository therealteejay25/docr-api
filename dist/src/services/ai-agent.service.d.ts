export interface AgentRequest {
    userId: string;
    message: string;
    context?: Record<string, any>;
}
export interface AgentResponse {
    message: string;
    status?: "thinking" | "executing" | "asking" | "completed" | "error";
    actions?: Array<{
        type: string;
        description: string;
        result?: any;
        status?: "pending" | "executing" | "completed" | "failed";
    }>;
    confirmation?: {
        type: "permission" | "choice" | "input";
        message: string;
        options?: Array<{
            label: string;
            value: string;
        }>;
        required?: boolean;
    };
    steps?: Array<{
        step: number;
        description: string;
        status: "pending" | "in_progress" | "completed" | "failed";
    }>;
    data?: any;
}
export interface StreamEvent {
    type: "status" | "thinking" | "action" | "confirmation" | "step" | "message" | "result" | "error";
    data: any;
    timestamp: number;
}
export declare class AIAgentService {
    private openai;
    constructor();
    processRequest(request: AgentRequest, onStream?: (event: StreamEvent) => void): Promise<AgentResponse>;
    private requiresConfirmation;
    private getConfirmationMessage;
    private getStepDescription;
    private getResultMessage;
    private getSystemPrompt;
    private buildUserContext;
    private getAvailableTools;
    private executeTool;
}
export declare const aiAgentService: AIAgentService;
//# sourceMappingURL=ai-agent.service.d.ts.map