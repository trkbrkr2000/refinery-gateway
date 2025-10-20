/**
 * API request/response types - pure TypeScript
 */

// Pipeline execution
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

// Component execution
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

// Job status
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