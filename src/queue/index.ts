/**
 * Queue job and message types - pure TypeScript
 */

export interface JobMessage {
  id: string;
  type: JobType;
  payload: any;
  metadata: JobMetadata;
}

export type JobType =
  | 'pipeline_execution'
  | 'component_execution'
  | 'data_processing'
  | 'cleanup';

export interface JobMetadata {
  pipelineId?: string;
  executionId?: string;
  componentId?: string;
  organizationId?: string;
  userId?: string;
  priority?: number;
  retryCount?: number;
  createdAt: Date;
}

export interface JobResult {
  jobId: string;
  success: boolean;
  data?: any;
  error?: string;
  metrics?: Record<string, any>;
}