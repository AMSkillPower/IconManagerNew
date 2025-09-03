export interface ImageRecord {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  tags: string[];
  uploadDate: Date;
  buffer: Buffer | Uint8Array;
}

export interface ImageSearchParams {
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ImageDownloadParams {
  id: string;
  format: 'png' | 'bmp' | 'ico' | 'svg';
  size: 1024 | 512 | 256 | 128 | 100 | 96 | 70 | 64 | 50 | 46 | 40 | 38 | 32 | 24 | 20 | 16;
}

export interface UploadResponse {
  success: boolean;
  imageId?: string;
  error?: string;
}