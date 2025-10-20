/**
 * Storage configuration interfaces - pure TypeScript, Bun compatible
 */

export interface StorageConfig {
  provider: 'minio' | 'google_drive' | 'box' | 'dropbox' | 's3' | 'gcs' | 'azure' | 'local';
  bucket?: string;
  region?: string;
  credentials?: any;
}

export interface S3Config {
  endpoint: string;
  accessKey?: string;
  secretKey?: string;
  region?: string;
  pathStyle?: boolean;
}

export interface MinioConfig extends S3Config {
  useSSL?: boolean;
  port?: number;
}

export interface StorageClient {
  read(bucket: string, key: string): Promise<any>;
  write(bucket: string, key: string, data: any, options?: WriteOptions): Promise<WriteResult>;
  writeJson(bucket: string, key: string, data: any, options?: WriteOptions): Promise<WriteResult>;
  readJson(bucket: string, key: string): Promise<any>;
  writeJsonl(bucket: string, key: string, data: any[], options?: WriteOptions): Promise<WriteResult>;
  readJsonl(bucket: string, key: string): Promise<any[]>;
  exists(bucket: string, key: string): Promise<boolean>;
  delete(bucket: string, key: string): Promise<void>;
  list(bucket: string, prefix: string): Promise<StorageObject[]>;
}

export interface WriteOptions {
  compression?: 'none' | 'gzip';
  metadata?: Record<string, string>;
  contentType?: string;
}

export interface WriteResult {
  bucket: string;
  key: string;
  url: string;
  size: number;
  etag?: string;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified: Date;
  etag?: string;
}