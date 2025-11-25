/**
 * Image processing utility to standardize image dimensions
 * Resizes and crops images to a target size while maintaining aspect ratio
 */

/**
 * Process an image file to standard dimensions
 * @param {File} file - The image file to process
 * @param {Object} options - Processing options
 * @param {number} options.width - Target width (default: 1200)
 * @param {number} options.height - Target height (default: 900)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.9)
 * @param {string} options.format - Output format: 'jpeg' or 'png' (default: 'jpeg')
 * @returns {Promise<File>} - Processed image file
 */
export const processImage = async (file, options = {}) => {
  const {
    width = 1200,
    height = 900,
    quality = 0.9,
    format = "jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas dimensions to target size
          canvas.width = width;
          canvas.height = height;

          // Calculate scaling to ensure the whole image stays visible (letterbox)
          const scale = Math.min(width / img.width, height / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const offsetX = (width - drawWidth) / 2;
          const offsetY = (height - drawHeight) / 2;

          // Fill background with white (for transparency in PNGs)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);

          // Draw and scale image
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to process image"));
                return;
              }

              // Create a new File object with the processed image
              const processedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, `.${format}`),
                {
                  type: format === "png" ? "image/png" : "image/jpeg",
                  lastModified: Date.now(),
                }
              );

              resolve(processedFile);
            },
            format === "png" ? "image/png" : "image/jpeg",
            quality
          );
        } catch (error) {
          reject(new Error(`Image processing failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Check if a file is an image
 * @param {File} file - File to check
 * @returns {boolean}
 */
export const isImageFile = (file) => {
  return file && file.type.startsWith("image/");
};

/**
 * Get recommended dimensions for different image types
 */
export const imageDimensions = {
  portfolio: { width: 1200, height: 900 },
  hero: { width: 800, height: 1000 },
  thumbnail: { width: 400, height: 300 },
};
