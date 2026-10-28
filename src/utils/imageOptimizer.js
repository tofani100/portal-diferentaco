/**
 * Client-Side Image Optimizer & Compressor
 * Automatically resizes and compresses images using WebP/Canvas.
 * Reduces 5MB-10MB phone/camera photos down to ~100KB-250KB without visual loss.
 */

export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    outputFormat = 'image/webp'
  } = options;

  // If not an image or unsupported format (e.g. svg, gif), return as data url
  if (!file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        file_url: reader.result,
        originalSize: file.size,
        optimizedSize: file.size,
        savedPercent: 0
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if Image cannot decode
        resolve({
          file_url: e.target.result,
          originalSize: file.size,
          optimizedSize: file.size,
          savedPercent: 0
        });
      };
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            file_url: e.target.result,
            originalSize: file.size,
            optimizedSize: file.size,
            savedPercent: 0
          });
          return;
        }

        // Apply high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first; if browser doesn't support canvas toDataURL webp, fallback to jpeg
        let compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        if (!compressedDataUrl.startsWith('data:image/webp') && outputFormat === 'image/webp') {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Approximate size of base64 data url in bytes
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const optimizedSize = Math.round((base64Length * 3) / 4);
        const originalSize = file.size;
        const savedPercent = originalSize > 0 
          ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
          : 0;

        console.log(`[ImageOptimizer] ${file.name || 'Image'}: ${(originalSize/1024).toFixed(1)} KB -> ${(optimizedSize/1024).toFixed(1)} KB (-${savedPercent}%) [${width}x${height}]`);

        resolve({
          file_url: compressedDataUrl,
          originalSize,
          optimizedSize,
          savedPercent,
          width,
          height
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
