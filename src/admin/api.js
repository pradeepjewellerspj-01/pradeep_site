// Admin API client. Every request carries the session cookie and the
// X-PJ-Admin header the server requires for changes.

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors ?? null;
  }
}

let onSignedOut = () => {};
export const setSignedOutHandler = (fn) => {
  onSignedOut = fn;
};

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api/admin/${path}`, {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'X-PJ-Admin': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your internet connection.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path !== 'login') onSignedOut();
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.errors);
  }
  return data;
}

const MAX_EDGE = 1600;
const MAX_BYTES = 2.5 * 1024 * 1024;

const toDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

/**
 * Resizes a photo in the browser (WebP, longest side `maxEdge`: 1600 for
 * products, up to 3200 for large-screen advertisements) and uploads it. Returns its URL.
 */
export async function uploadPhoto(file, { maxEdge = MAX_EDGE } = {}) {
  if (!/^image\//.test(file.type)) throw new ApiError(415, 'Choose a photo (JPEG, PNG or WebP)');
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new ApiError(415, 'This photo could not be read. Try a JPEG or PNG.');
  });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  let blob = null;
  for (const quality of [0.86, 0.75, 0.6]) {
    blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality));
    if (blob && blob.size <= MAX_BYTES) break;
  }
  if (!blob || blob.size > MAX_BYTES) throw new ApiError(413, 'This photo is too large even after resizing');
  const { url } = await api('images', { method: 'POST', body: { dataUrl: await toDataUrl(blob) } });
  return url;
}

const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_VIDEO_BYTES = 3 * 1024 * 1024;

/**
 * Uploads a short video loop (MP4 or WebM, up to 3 MB) as it is. Longer
 * videos are linked by URL instead (a host such as Cloudinary or Bunny).
 */
export async function uploadVideo(file) {
  if (!VIDEO_TYPES.includes(file.type)) throw new ApiError(415, 'Choose an MP4 or WebM video');
  if (file.size > MAX_VIDEO_BYTES) throw new ApiError(413, 'Videos up to 3 MB can be uploaded here. For a longer video, paste its https link instead.');
  const { url } = await api('images', { method: 'POST', body: { dataUrl: await toDataUrl(file) } });
  return url;
}
