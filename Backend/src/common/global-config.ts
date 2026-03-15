import dotenv from 'dotenv';

dotenv.config();

/**
 * MinIO Configuration Interface
 * Contains all necessary settings to connect to MinIO server
 */
export interface MinIOConfig {
  endPoint: string;        // MinIO server endpoint (e.g., 'localhost' or 'minio.example.com')
  port: number;            // MinIO server port (default: 9000)
  useSSL: boolean;         // Whether to use SSL/TLS (HTTPS)
  accessKey: string;       // MinIO access key (username)
  secretKey: string;       // MinIO secret key (password)
  region?: string;         // Optional region (default: 'us-east-1')
}

/**
 * Bucket Names Configuration
 * Centralized bucket names for different file types
 * This makes it easy to manage and add new buckets in the future
 */
export const BUCKETS = {
  USER_PROFILE_PICTURES: 'user-profile-pictures',  // For user profile images
  SCHOOL_LOGOS: 'school-logos',                    // For school logos
  DOCUMENTS: 'documents',                          // For general documents
  BUDGET_DOCUMENTS: 'budget-documents',            // For budget-related documents
  SCHOOL_DOCUMENTS: 'school-documents',            // For school-related documents
  // Add more buckets as needed in the future
} as const;

/**
 * Get MinIO Configuration from Environment Variables
 * Reads configuration from .env file and returns a MinIOConfig object
 * 
 * Required environment variables:
 * - MINIO_ENDPOINT: MinIO server endpoint
 * - MINIO_PORT: MinIO server port (default: 9000)
 * - MINIO_USE_SSL: Whether to use SSL (default: false)
 * - MINIO_ACCESS_KEY: MinIO access key
 * - MINIO_SECRET_KEY: MinIO secret key
 * - MINIO_REGION: Optional region (default: 'us-east-1')
 */
export function getMinIOConfig(): MinIOConfig {
  const endPoint = process.env.MINIO_ENDPOINT;
  const port = parseInt(process.env.MINIO_PORT || '9000', 10);
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const region = process.env.MINIO_REGION || 'us-east-1';

  // Validate required environment variables
  if (!endPoint) {
    throw new Error('MINIO_ENDPOINT is not set in environment variables');
  }
  if (!accessKey) {
    throw new Error('MINIO_ACCESS_KEY is not set in environment variables');
  }
  if (!secretKey) {
    throw new Error('MINIO_SECRET_KEY is not set in environment variables');
  }

  return {
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey,
    region,
  };
}

/**
 * Get MinIO Public URL (for accessing files)
 * Constructs the public URL to access files stored in MinIO
 * 
 * @param bucketName - Name of the bucket
 * @param objectName - Name/path of the object in the bucket
 * @returns Public URL to access the file
 */
export function getMinIOPublicURL(bucketName: string, objectName: string): string {
  const config = getMinIOConfig();
  const protocol = config.useSSL ? 'https' : 'http';
  const baseURL = process.env.MINIO_PUBLIC_URL || `${protocol}://${config.endPoint}:${config.port}`;
  
  // Remove trailing slash from baseURL if present
  const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  
  return `${cleanBaseURL}/${bucketName}/${objectName}`;
}


