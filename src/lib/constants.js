/**
 * Shared constants and configuration.
 */

export const CONTENT_TYPES = {
  TEAM: "team",
  EVENT: "event",
  GALLERY: "gallery",
};

export const STORAGE_BUCKET = "institute-assets";

/**
 * Maximum file upload size in bytes (5 MB).
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types for uploads.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
