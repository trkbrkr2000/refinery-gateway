/**
 * Common configuration interfaces for components
 */

import { StorageConfig } from '../storage';

/**
 * Base configuration for all components
 */
export interface BaseComponentConfig {
  /** Optional: Override default timeout */
  timeout?: number;

  /** Optional: Retry configuration */
  retry?: RetryConfig;

  /** Optional: Component-specific metadata */
  metadata?: Record<string, any>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;

  /** Initial delay between retries in ms */
  initialDelayMs: number;

  /** Maximum delay between retries in ms */
  maxDelayMs?: number;

  /** Backoff multiplier */
  backoffMultiplier?: number;

  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
}

/**
 * Configuration for Reader components
 */
export interface ReaderConfig extends BaseComponentConfig {
  /** Source location/configuration */
  source?: string;

  /** Storage configuration for cloud/remote sources */
  storage?: StorageConfig;

  /** Input format */
  format?: string;

  /** Optional: Filters to apply when reading */
  filters?: Record<string, any>;

  /** Optional: Fields to select */
  select?: string[];

  /** Optional: Maximum records to read */
  limit?: number;

  /** Optional: Number of records to skip */
  offset?: number;

  /** Optional: Batch size for reading */
  batchSize?: number;

  /** Optional: Output path for processed data */
  outputPath?: string;
}

/**
 * Configuration for Writer components
 */
export interface WriterConfig extends BaseComponentConfig {
  /** Input data source (path or inline) */
  inputPath?: string;

  /** Destination configuration */
  destination?: DestinationConfig;

  /** Storage configuration for cloud destinations */
  storage?: StorageConfig;

  /** Output format */
  format?: string;

  /** Write mode */
  mode?: 'append' | 'overwrite' | 'error_if_exists';

  /** Partitioning configuration */
  partitioning?: PartitionConfig;

  /** Optional: Data transformations to apply */
  dataTransforms?: DataTransform[];

  /** Optional: Compression settings */
  compression?: CompressionConfig;

  /** Optional: Schema for validation */
  schema?: any;
}

/**
 * Destination configuration
 */
export interface DestinationConfig {
  /** Bucket/container name */
  bucket?: string;

  /** Path prefix */
  prefix?: string;

  /** Database table */
  table?: string;

  /** API endpoint */
  endpoint?: string;

  /** Full path */
  path?: string;
}

/**
 * Partitioning configuration
 */
export interface PartitionConfig {
  /** Partitioning strategy */
  strategy: 'field' | 'time' | 'hash' | 'size' | 'none';

  /** Field to partition by (for field strategy) */
  field?: string;

  /** Fields for composite partitioning */
  fields?: string[];

  /** Time unit for time-based partitioning */
  timeUnit?: 'hour' | 'day' | 'week' | 'month' | 'year';

  /** Time field for time-based partitioning */
  timeField?: string;

  /** Number of hash partitions */
  hashPartitions?: number;

  /** Maximum partition size in bytes */
  maxSizeBytes?: number;

  /** Maximum records per partition */
  maxRecords?: number;
}

/**
 * Data transformation configuration
 */
export interface DataTransform {
  /** Transformation type */
  type: 'field_mapping' | 'filter' | 'compute' | 'aggregate' | 'custom';

  /** Transformation-specific configuration */
  config: Record<string, any>;
}

/**
 * Compression configuration
 */
export interface CompressionConfig {
  /** Compression type */
  type: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';

  /** Compression level (1-9 for gzip) */
  level?: number;
}

/**
 * Configuration for Transformer components
 */
export interface TransformerConfig extends BaseComponentConfig {
  /** Input data source */
  inputPath?: string;

  /** Output destination */
  outputPath?: string;

  /** Transformation operations */
  operations?: TransformOperation[];

  /** Optional: Schema for input validation */
  inputSchema?: any;

  /** Optional: Schema for output validation */
  outputSchema?: any;
}

/**
 * Transformation operation
 */
export interface TransformOperation {
  /** Operation type */
  type: string;

  /** Operation-specific configuration */
  config: Record<string, any>;

  /** Optional: Condition for applying operation */
  condition?: string;
}

/**
 * Configuration for Enrichment components
 */
export interface EnrichmentConfig extends BaseComponentConfig {
  /** Input data source */
  inputPath?: string;

  /** Output destination */
  outputPath?: string;

  /** Enrichment source configuration */
  enrichmentSource?: EnrichmentSource;

  /** Fields to enrich */
  enrichFields?: string[];

  /** Mapping configuration */
  mapping?: Record<string, string>;

  /** Optional: Cache configuration */
  cache?: CacheConfig;
}

/**
 * Enrichment source configuration
 */
export interface EnrichmentSource {
  /** Source type */
  type: 'api' | 'database' | 'file' | 'service';

  /** Source-specific configuration */
  config: Record<string, any>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;

  /** Cache TTL in seconds */
  ttlSeconds?: number;

  /** Maximum cache size */
  maxSize?: number;

  /** Cache strategy */
  strategy?: 'lru' | 'lfu' | 'ttl';
}