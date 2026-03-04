/**
 * Returns the full URL for a thumbnail image.
 * Thumbnails are stored as relative paths (e.g. /uploads/thumbnails/xxx.png)
 * on the backend server. This helper prepends the BACKEND_URL so images
 * correctly resolve to the Railway backend regardless of which domain
 * the frontend is served from.
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export function getThumbnailUrl(thumbnail) {
    if (!thumbnail) return '/placeholder-course.png';
    // Already an absolute URL (e.g. https://...) — use as-is
    if (thumbnail.startsWith('http')) return thumbnail;
    // Relative path — prepend backend URL
    return `${BACKEND_URL}${thumbnail}`;
}
