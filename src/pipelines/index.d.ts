/**
 * Pipeline and execution types - pure TypeScript
 */
export interface Pipeline {
    id: string;
    name: string;
    description?: string;
    organizationId: string;
    userId?: string;
    steps: PipelineStep[];
    connections: PipelineConnection[];
    status: 'draft' | 'active' | 'archived';
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface PipelineStep {
    id: string;
    name: string;
    type: string;
    subtype?: string;
    componentId?: string;
    config: Record<string, any>;
    position: {
        x: number;
        y: number;
    };
    order: number;
}
export interface PipelineConnection {
    id: string;
    from: string;
    to: string;
    type: 'data' | 'control';
}
export interface PipelineExecution {
    id: string;
    pipelineId: string;
    status: ExecutionStatus;
    startTime: Date;
    endTime?: Date;
    error?: string;
    metrics?: Record<string, any>;
}
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';
//# sourceMappingURL=index.d.ts.map