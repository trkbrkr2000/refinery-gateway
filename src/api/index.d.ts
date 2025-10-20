/**
 * API request/response types - pure TypeScript
 */
export interface ExecutePipelineRequest {
    pipelineId: string;
    parameters?: Record<string, any>;
    idempotencyKey?: string;
}
export interface ExecutePipelineResponse {
    executionId: string;
    jobId: string;
    status: string;
}
export interface ExecuteComponentRequest {
    config: Record<string, any>;
    context: {
        executionId: string;
        componentId: string;
        organizationId?: string;
        userId?: string;
    };
}
export interface ExecuteComponentResponse {
    success: boolean;
    recordsProcessed?: number;
    outputPath?: string;
    error?: string;
    metadata?: Record<string, any>;
}
export interface JobStatusRequest {
    jobId: string;
}
export interface JobStatusResponse {
    jobId: string;
    status: string;
    progress?: number;
    result?: any;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map