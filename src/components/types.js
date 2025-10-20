/**
 * Component type definitions and enumerations
 */
/**
 * High-level component categories
 */
export var ComponentType;
(function (ComponentType) {
    ComponentType["READER"] = "reader";
    ComponentType["WRITER"] = "writer";
    ComponentType["TRANSFORMER"] = "transformer";
    ComponentType["ENRICHMENT"] = "enrichment";
})(ComponentType || (ComponentType = {}));
/**
 * Specific component subtypes for semantic categorization
 */
export var ComponentSubtype;
(function (ComponentSubtype) {
    // Network/API Components
    ComponentSubtype["API"] = "api";
    ComponentSubtype["WEBHOOK"] = "webhook";
    ComponentSubtype["GRAPHQL"] = "graphql";
    ComponentSubtype["GRPC"] = "grpc";
    // Cloud Storage Components
    ComponentSubtype["S3"] = "s3";
    ComponentSubtype["GCS"] = "gcs";
    ComponentSubtype["AZURE_BLOB"] = "azure_blob";
    // File Format Components
    ComponentSubtype["FILE_JSON"] = "file_json";
    ComponentSubtype["FILE_CSV"] = "file_csv";
    ComponentSubtype["FILE_XML"] = "file_xml";
    ComponentSubtype["FILE_PARQUET"] = "file_parquet";
    ComponentSubtype["FILE_AVRO"] = "file_avro";
    ComponentSubtype["FILE_ORC"] = "file_orc";
    // Database Components
    ComponentSubtype["DATABASE"] = "database";
    ComponentSubtype["DB_POSTGRES"] = "db_postgres";
    ComponentSubtype["DB_MYSQL"] = "db_mysql";
    ComponentSubtype["DB_MONGODB"] = "db_mongodb";
    ComponentSubtype["DB_REDIS"] = "db_redis";
    ComponentSubtype["DB_ELASTICSEARCH"] = "db_elasticsearch";
    ComponentSubtype["DB_DYNAMODB"] = "db_dynamodb";
    ComponentSubtype["DB_CASSANDRA"] = "db_cassandra";
    // Transformation Components
    ComponentSubtype["MAP"] = "map";
    ComponentSubtype["FILTER"] = "filter";
    ComponentSubtype["AGGREGATE"] = "aggregate";
    ComponentSubtype["JOIN"] = "join";
    ComponentSubtype["SORT"] = "sort";
    ComponentSubtype["DEDUPE"] = "dedupe";
    ComponentSubtype["PIVOT"] = "pivot";
    ComponentSubtype["UNPIVOT"] = "unpivot";
    ComponentSubtype["LOOKUP"] = "lookup";
    // Enrichment Components
    ComponentSubtype["GEOCODE"] = "geocode";
    ComponentSubtype["SENTIMENT"] = "sentiment";
    ComponentSubtype["TRANSLATE"] = "translate";
    ComponentSubtype["VALIDATE"] = "validate";
    ComponentSubtype["CLEANSE"] = "cleanse";
    // Stream Processing
    ComponentSubtype["KAFKA"] = "kafka";
    ComponentSubtype["KINESIS"] = "kinesis";
    ComponentSubtype["PUBSUB"] = "pubsub";
    ComponentSubtype["EVENTHUB"] = "eventhub";
    // Legacy/Other
    ComponentSubtype["PIPELINE"] = "pipeline";
    ComponentSubtype["CUSTOM"] = "custom";
})(ComponentSubtype || (ComponentSubtype = {}));
//# sourceMappingURL=types.js.map