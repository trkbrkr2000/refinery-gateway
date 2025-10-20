/**
 * Component type definitions and enumerations
 */

/**
 * High-level component categories
 */
export enum ComponentType {
  READER = 'reader',
  WRITER = 'writer',
  TRANSFORMER = 'transformer',
  ENRICHMENT = 'enrichment'
}

/**
 * Specific component subtypes for semantic categorization
 */
export enum ComponentSubtype {
  // Network/API Components
  API = 'api',
  WEBHOOK = 'webhook',
  GRAPHQL = 'graphql',
  GRPC = 'grpc',

  // Cloud Storage Components
  S3 = 's3',
  GCS = 'gcs',
  AZURE_BLOB = 'azure_blob',

  // File Format Components
  FILE_JSON = 'file_json',
  FILE_CSV = 'file_csv',
  FILE_XML = 'file_xml',
  FILE_PARQUET = 'file_parquet',
  FILE_AVRO = 'file_avro',
  FILE_ORC = 'file_orc',

  // Database Components
  DATABASE = 'database',
  DB_POSTGRES = 'db_postgres',
  DB_MYSQL = 'db_mysql',
  DB_MONGODB = 'db_mongodb',
  DB_REDIS = 'db_redis',
  DB_ELASTICSEARCH = 'db_elasticsearch',
  DB_DYNAMODB = 'db_dynamodb',
  DB_CASSANDRA = 'db_cassandra',

  // Transformation Components
  MAP = 'map',
  FILTER = 'filter',
  AGGREGATE = 'aggregate',
  JOIN = 'join',
  SORT = 'sort',
  DEDUPE = 'dedupe',
  PIVOT = 'pivot',
  UNPIVOT = 'unpivot',
  LOOKUP = 'lookup',

  // Enrichment Components
  GEOCODE = 'geocode',
  SENTIMENT = 'sentiment',
  TRANSLATE = 'translate',
  VALIDATE = 'validate',
  CLEANSE = 'cleanse',

  // Stream Processing
  KAFKA = 'kafka',
  KINESIS = 'kinesis',
  PUBSUB = 'pubsub',
  EVENTHUB = 'eventhub',

  // Legacy/Other
  PIPELINE = 'pipeline',
  CUSTOM = 'custom'
}

/**
 * Component metadata for registration
 */
export interface ComponentMetadata {
  /** Unique component identifier */
  id: string;

  /** Component type */
  type: ComponentType;

  /** Component subtype for semantic categorization */
  subtype: ComponentSubtype;

  /** Display name */
  name: string;

  /** Component description */
  description: string;

  /** Component version */
  version: string;

  /** Author/organization */
  author?: string;

  /** Component icon (URL or identifier) */
  icon?: string;

  /** Component documentation URL */
  documentationUrl?: string;

  /** Tags for categorization */
  tags?: string[];

  /** Whether component is beta/experimental */
  beta?: boolean;

  /** Whether component is deprecated */
  deprecated?: boolean;

  /** Deprecation message if deprecated */
  deprecationMessage?: string;

  /** Component capabilities */
  capabilities?: ComponentCapabilities;
}

/**
 * Component capabilities declaration
 */
export interface ComponentCapabilities {
  /** Whether component supports streaming */
  streaming?: boolean;

  /** Whether component supports batch processing */
  batch?: boolean;

  /** Whether component supports parallel execution */
  parallel?: boolean;

  /** Whether component supports transactions */
  transactional?: boolean;

  /** Whether component supports schema inference */
  schemaInference?: boolean;

  /** Whether component supports incremental processing */
  incremental?: boolean;

  /** Maximum records per batch */
  maxBatchSize?: number;

  /** Supported input formats */
  supportedInputFormats?: string[];

  /** Supported output formats */
  supportedOutputFormats?: string[];
}

/**
 * Component registry entry combining metadata with implementation
 */
export interface ComponentRegistryEntry {
  /** Component metadata */
  metadata: ComponentMetadata;

  /** JSON Schema for configuration validation */
  configSchema?: any;

  /** Component implementation (in processor service) */
  component?: any;

  /** Processor service endpoint (in API service) */
  endpoint?: string;
}