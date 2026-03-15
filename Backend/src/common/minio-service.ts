import * as MinIO from 'minio';
import { getMinIOConfig, BUCKETS, getMinIOPublicURL } from './global-config';

/**
 * MinIO Service
 * 
 * This service provides a clean interface for interacting with MinIO object storage.
 * It handles file uploads, downloads, deletions, and URL generation.
 * 
 * Key Features:
 * - Automatic bucket creation if it doesn't exist
 * - Support for different file types (images, documents, etc.)
 * - Secure file access with presigned URLs
 * - Error handling and validation
 * 
 * Usage Example:
 * ```typescript
 * // Upload a profile picture
 * const fileUrl = await MinIOService.uploadFile(
 *   BUCKETS.USER_PROFILE_PICTURES,
 *   userId,
 *   fileBuffer,
 *   'image/jpeg'
 * );
 * 
 * // Get a presigned URL (valid for 7 days)
 * const url = await MinIOService.getPresignedURL(
 *   BUCKETS.USER_PROFILE_PICTURES,
 *   userId
 * );
 * 
 * // Delete a file
 * await MinIOService.deleteFile(
 *   BUCKETS.USER_PROFILE_PICTURES,
 *   userId
 * );
 * ```
 */
export class MinIOService {
  private static client: MinIO.Client | null = null;
  private static isInitialized: boolean = false;
  private static initializedBuckets: Set<string> = new Set();

  /**
   * Initialize MinIO Client
   * Creates a singleton MinIO client instance
   * This method is called automatically on first use
   */
  private static initialize(): void {
    if (!this.isInitialized) {
      try {
        const config = getMinIOConfig();
        this.client = new MinIO.Client({
          endPoint: config.endPoint,
          port: config.port,
          useSSL: config.useSSL,
          accessKey: config.accessKey,
          secretKey: config.secretKey,
          region: config.region,
        });
        this.isInitialized = true;
        console.log('MinIO client initialized successfully');
      } catch (error: any) {
        console.error('Failed to initialize MinIO client:', error);
        throw new Error(`MinIO initialization failed: ${error.message}`);
      }
    }
  }

  /**
   * Ensure Bucket Exists
   * Creates a bucket if it doesn't exist
   * This is called automatically before operations
   * 
   * @param bucketName - Name of the bucket to ensure exists
   */
  private static async ensureBucketExists(bucketName: string): Promise<void> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    // Check if we've already initialized this bucket in this session
    if (this.initializedBuckets.has(bucketName)) {
      return;
    }

    try {
      const exists = await this.client.bucketExists(bucketName);
      if (!exists) {
        const config = getMinIOConfig();
        await this.client.makeBucket(bucketName, config.region);
        console.log(`Bucket "${bucketName}" created successfully`);
        
        // Set public read policy for the bucket
        await this.setBucketPublicReadPolicy(bucketName);
        console.log(`Bucket "${bucketName}" set to public read access`);
      } else {
        // Even if bucket exists, ensure it has the right policy
        try {
          await this.setBucketPublicReadPolicy(bucketName);
        } catch (error) {
          // Policy might already be set, continue
          console.log(`Bucket "${bucketName}" policy already configured or update failed`);
        }
      }
      this.initializedBuckets.add(bucketName);
    } catch (error: any) {
      console.error(`Error ensuring bucket "${bucketName}" exists:`, error);
      throw new Error(`Failed to ensure bucket exists: ${error.message}`);
    }
  }

  /**
   * Set Bucket Policy for Public Read Access
   * Allows anyone to read objects in the bucket
   * 
   * @param bucketName - Name of the bucket
   */
  private static async setBucketPublicReadPolicy(bucketName: string): Promise<void> {
    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    try {
      await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
    } catch (error: any) {
      console.error(`Error setting bucket policy for "${bucketName}":`, error);
      throw error;
    }
  }

  /**
   * Upload File to MinIO
   * 
   * Uploads a file buffer to the specified bucket with a unique object name.
   * Automatically creates the bucket if it doesn't exist.
   * 
   * @param bucketName - Name of the bucket (use BUCKETS constants)
   * @param objectName - Unique name/path for the object (e.g., userId, userId/timestamp)
   * @param fileBuffer - Buffer containing the file data
   * @param contentType - MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
   * @param metadata - Optional metadata to attach to the object
   * @returns Promise resolving to the public URL of the uploaded file
   * 
   * @example
   * ```typescript
   * const url = await MinIOService.uploadFile(
   *   BUCKETS.USER_PROFILE_PICTURES,
   *   `profile-${userId}.jpg`,
   *   imageBuffer,
   *   'image/jpeg'
   * );
   * ```
   */
  static async uploadFile(
    bucketName: string,
    objectName: string,
    fileBuffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      // Ensure bucket exists
      await this.ensureBucketExists(bucketName);

      // Prepare metadata
      const metaData: Record<string, string> = {
        'Content-Type': contentType,
        ...metadata,
      };

      // Upload file
      await this.client.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, metaData);
      
      console.log(`File uploaded successfully: ${bucketName}/${objectName}`);
      
      // Return public URL
      return getMinIOPublicURL(bucketName, objectName);
    } catch (error: any) {
      console.error('Error uploading file to MinIO:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get Presigned URL
   * 
   * Generates a presigned URL that allows temporary access to a file.
   * Useful for secure file sharing without making buckets public.
   * 
   * @param bucketName - Name of the bucket
   * @param objectName - Name/path of the object
   * @param expirySeconds - URL expiration time in seconds (default: 7 days)
   * @returns Promise resolving to a presigned URL
   * 
   * @example
   * ```typescript
   * const url = await MinIOService.getPresignedURL(
   *   BUCKETS.USER_PROFILE_PICTURES,
   *   'profile-user-123.jpg',
   *   3600 // 1 hour
   * );
   * ```
   */
  static async getPresignedURL(
    bucketName: string,
    objectName: string,
    expirySeconds: number = 7 * 24 * 60 * 60 // 7 days default
  ): Promise<string> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      const url = await this.client.presignedGetObject(bucketName, objectName, expirySeconds);
      return url;
    } catch (error: any) {
      console.error('Error generating presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Download File from MinIO
   * 
   * Downloads a file from MinIO and returns it as a Buffer.
   * 
   * @param bucketName - Name of the bucket
   * @param objectName - Name/path of the object
   * @returns Promise resolving to a Buffer containing the file data
   * 
   * @example
   * ```typescript
   * const fileBuffer = await MinIOService.downloadFile(
   *   BUCKETS.USER_PROFILE_PICTURES,
   *   'profile-user-123.jpg'
   * );
   * ```
   */
  static async downloadFile(bucketName: string, objectName: string): Promise<Buffer> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      const dataStream = await this.client.getObject(bucketName, objectName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        dataStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        dataStream.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error: any) {
      console.error('Error downloading file from MinIO:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete File from MinIO
   * 
   * Deletes a file from the specified bucket.
   * 
   * @param bucketName - Name of the bucket
   * @param objectName - Name/path of the object to delete
   * @returns Promise that resolves when the file is deleted
   * 
   * @example
   * ```typescript
   * await MinIOService.deleteFile(
   *   BUCKETS.USER_PROFILE_PICTURES,
   *   'profile-user-123.jpg'
   * );
   * ```
   */
  static async deleteFile(bucketName: string, objectName: string): Promise<void> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      await this.client.removeObject(bucketName, objectName);
      console.log(`File deleted successfully: ${bucketName}/${objectName}`);
    } catch (error: any) {
      console.error('Error deleting file from MinIO:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Check if File Exists
   * 
   * Checks whether a file exists in the specified bucket.
   * 
   * @param bucketName - Name of the bucket
   * @param objectName - Name/path of the object
   * @returns Promise resolving to true if file exists, false otherwise
   * 
   * @example
   * ```typescript
   * const exists = await MinIOService.fileExists(
   *   BUCKETS.USER_PROFILE_PICTURES,
   *   'profile-user-123.jpg'
   * );
   * ```
   */
  static async fileExists(bucketName: string, objectName: string): Promise<boolean> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      await this.client.statObject(bucketName, objectName);
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get File Metadata
   * 
   * Retrieves metadata about a file stored in MinIO.
   * 
   * @param bucketName - Name of the bucket
   * @param objectName - Name/path of the object
   * @returns Promise resolving to file metadata
   * 
   * @example
   * ```typescript
   * const metadata = await MinIOService.getFileMetadata(
   *   BUCKETS.USER_PROFILE_PICTURES,
   *   'profile-user-123.jpg'
   * );
   * console.log(metadata.size, metadata.metaData);
   * ```
   */
  static async getFileMetadata(bucketName: string, objectName: string): Promise<MinIO.BucketItemStat> {
    if (!this.client) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      const stat = await this.client.statObject(bucketName, objectName);
      return stat;
    } catch (error: any) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

export default MinIOService;

