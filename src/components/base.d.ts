/**
 * Core component interfaces for Refinery Platform
 * These interfaces define the base contracts for all component types
 */
/**
 * Base Component Interface
 * All components (readers, writers, transformers, enrichments) must implement this interface
 */
export interface Component<TConfig = any, TResult = any> {
    /**
     * Unique identifier for the component type
     */
    readonly type: string;
    /**
     * Component version following semver
     */
    readonly version: string;
    /**
     * Human-readable description of what this component does
     */
    readonly description?: string;
    /**
     * Execute the component with given configuration and context
     */
    execute(config: TConfig, context: ExecutionContext): Promise<TResult>;
    /**
     * Validate configuration before execution
     */
    validate(config: TConfig): ValidationResult;
    /**
     * Optional: Test the component connection/configuration
     */
    test?(config: TConfig): Promise<TestResult>;
}
/**
 * Execution Context passed to every component
 * Contains runtime information and utilities
 */
export interface ExecutionContext {
    /** Unique identifier for this pipeline run */
    pipelineRunId: string;
    /** Component instance identifier */
    componentId: string;
    /** Execution environment */
    environment: 'development' | 'staging' | 'production';
    /** Pipeline variables available to the component */
    variables: Record<string, string>;
    /** Secrets available to the component */
    secrets: Record<string, string>;
    /** Logger instance for component output */
    logger: Logger;
    /** Optional: Organization context */
    organizationId?: string;
    /** Optional: User context */
    userId?: string;
}
/**
 * Logger Interface for component logging
 */
export interface Logger {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, error?: Error, meta?: any): void;
    debug(message: string, meta?: any): void;
}
/**
 * Base Result Interface returned by all components
 */
export interface ComponentResult {
    /** Indicates if the component execution was successful */
    success: boolean;
    /** Optional: Path to output data */
    outputPath?: string;
    /** Number of records processed */
    recordsProcessed?: number;
    /** Number of records written (for writers) */
    recordsWritten?: number;
    /** Execution metrics */
    metrics?: Metrics;
    /** Error message if success is false */
    error?: string;
    /** Detailed errors if multiple failures occurred */
    errors?: ErrorDetail[];
    /** Additional metadata about the execution */
    metadata?: Record<string, any>;
    /** Optional: Actual data (for in-memory operations) */
    data?: any;
}
/**
 * Execution Metrics
 */
export interface Metrics {
    /** When execution started */
    startTime?: Date;
    /** When execution completed */
    endTime?: Date;
    /** Duration in milliseconds */
    duration?: number;
    /** Bytes processed */
    bytesProcessed?: number;
    /** Bytes written */
    bytesWritten?: number;
    /** Error rate (0-1) */
    errorRate?: number;
    /** Throughput (records per second) */
    throughput?: number;
    /** Memory usage in MB */
    memoryUsageMb?: number;
    /** CPU usage percentage */
    cpuUsagePercent?: number;
    /** Allow component-specific metrics */
    [key: string]: any;
}
/**
 * Error Details for granular error reporting
 */
export interface ErrorDetail {
    /** When the error occurred */
    timestamp: Date;
    /** Error type/category */
    type: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: any;
    /** Whether this error can be retried */
    retryable: boolean;
    /** Optional: Record number where error occurred */
    recordNumber?: number;
    /** Optional: Stack trace */
    stack?: string;
}
/**
 * Validation Result for configuration validation
 */
export interface ValidationResult {
    /** Whether the configuration is valid */
    valid: boolean;
    /** List of validation errors */
    errors: string[];
    /** List of warnings (non-fatal) */
    warnings: string[];
    /** Optional: Suggestions for fixing errors */
    suggestions?: string[];
}
/**
 * Test Result for connection/configuration testing
 */
export interface TestResult {
    /** Whether the test passed */
    success: boolean;
    /** Sample data retrieved during test */
    sampleData?: any[];
    /** Error message if test failed */
    error?: string;
    /** Test execution metadata */
    metadata?: Record<string, any>;
}
//# sourceMappingURL=base.d.ts.map