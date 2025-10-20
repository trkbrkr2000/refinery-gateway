/**
 * Common types - pure TypeScript
 */
export interface User {
    id: string;
    email: string;
    name?: string;
    organizationId: string;
}
export interface Organization {
    id: string;
    name: string;
    plan?: string;
}
export interface ApiKey {
    id: string;
    key: string;
    name?: string;
    organizationId: string;
    scopes: string[];
    expiresAt?: Date;
}
export interface DataSource {
    id: string;
    name: string;
    type: string;
    storage?: {
        path: string;
        bucket?: string;
    };
    schema?: any;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map