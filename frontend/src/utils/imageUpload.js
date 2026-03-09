/**
 * Prepare image files for thumbnail upload to avoid proxy/body-size failures.
 * Returns original file if already small enough.
 */
export async function prepareThumbnailFile(file, options = {}) {
  const {
    maxBytes = 4 * 1024 * 1024, // 4MB default safe limit
    maxDimension = 1920,
    initialQuality = 0.82,
  } = options;

  if (!file) return file;
  if (!file.type?.startsWith('image/')) return file;
  if (file.size <= maxBytes) return file;

  const image = await loadImage(file);

  let width = image.naturalWidth || image.width;
  let height = image.naturalHeight || image.height;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);

  // Retry with lower quality and dimensions until within target size.
  for (let i = 0; blob && blob.size > maxBytes && i < 5; i += 1) {
    quality = Math.max(0.5, quality - 0.08);
    const shrink = 0.9;
    width = Math.max(1, Math.round(width * shrink));
    height = Math.max(1, Math.round(height * shrink));
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  if (!blob) return file;

  const safeName = (file.name || 'thumbnail').replace(/\.[^.]+$/, '');
  return new File([blob], `${safeName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export function getUploadErrorMessage(error, fallback = 'Failed to upload thumbnail') {
  const status = error?.response?.status;
  if (status === 413) {
    return 'Image is too large. Please use a smaller thumbnail image.';
  }
  if (status === 401) {
    return 'Session expired. Please login again.';
  }
  if (status === 403) {
    return 'You do not have permission to upload thumbnail.';
  }
  return error?.response?.data?.detail || fallback;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
