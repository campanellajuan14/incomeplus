export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxSizeKB?: number;
}

export interface CompressedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dataUrl: string;
}

/**
 * Compresses an image file using Canvas and converts to WebP format
 */
export const compressImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImage> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp',
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with specified format and quality
      let currentQuality = quality;
      
      const processBlob = async (blob: Blob | null) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }

        // If still too large, reduce quality iteratively
        let currentBlob = blob;
        
        while (currentBlob.size > maxSizeKB * 1024 && currentQuality > 0.1) {
          currentQuality -= 0.1;
          
          const newBlob = await new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob(resolveBlob, `image/${format}`, currentQuality);
          });
          
          if (newBlob) {
            currentBlob = newBlob;
          } else {
            break;
          }
        }

        // Create compressed file
        const compressedFile = new File(
          [currentBlob],
          `${file.name.split('.')[0]}.${format === 'jpeg' ? 'jpg' : format}`,
          { type: `image/${format}` }
        );

        // Generate data URL for preview
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            file: compressedFile,
            originalSize: file.size,
            compressedSize: currentBlob.size,
            compressionRatio: Math.round((1 - currentBlob.size / file.size) * 100),
            dataUrl: reader.result as string
          });
        };
        reader.readAsDataURL(currentBlob);
      };

      canvas.toBlob(processBlob, `image/${format}`, currentQuality);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses multiple images in parallel
 */
export const compressImages = async (
  files: File[],
  options: ImageCompressionOptions = {}
): Promise<CompressedImage[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Generates a blur data URL for use as a placeholder
 */
export const generateBlurDataUrl = (width: number = 40, height: number = 40): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = width;
  canvas.height = height;
  
  // Create a gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(0.5, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/webp', 0.1);
};

/**
 * Creates a low-quality placeholder from an image
 */
export const createImagePlaceholder = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(generateBlurDataUrl());
      return;
    }

    img.onload = () => {
      // Create a very small version for blur effect
      canvas.width = 20;
      canvas.height = 20;
      
      ctx.drawImage(img, 0, 0, 20, 20);
      
      // Convert to very low quality data URL
      const dataUrl = canvas.toDataURL('image/webp', 0.1);
      resolve(dataUrl);
    };

    img.onerror = () => {
      resolve(generateBlurDataUrl());
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validates if a file is a valid image
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extracts image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}; 