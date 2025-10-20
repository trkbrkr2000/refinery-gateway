/**
 * Storage configuration interfaces - pure TypeScript, Bun compatible
 */
export interface StorageConfig {
    provider: 'minio' | 's3' | 'gcs' | 'azure' | 'local';
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
    write(bucket: string, key: string, data: any): Promise<WriteResult>;
    exists(bucket: string, key: string): Promise<boolean>;
    delete(bucket: string, key: string): Promise<void>;
    list(bucket: string, prefix: string): Promise<StorageObject[]>;
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
//# sourceMappingURL=index.d.ts.map