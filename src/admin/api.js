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

const WATERMARK = 'PRADEEP JEWELLERS';

const WATERMARK_FONT = (px) => `600 ${px}px Fraunces, Georgia, serif`;
const ANGLE = -Math.PI / 6;

/** The largest font size up to `max` at which `text` is at most `width` wide. */
function fitFont(ctx, text, max, width) {
  ctx.font = WATERMARK_FONT(max);
  const fits = Math.floor((max * width) / ctx.measureText(text).width);
  return Math.max(8, Math.min(max, fits));
}

/**
 * Stamps the shop's name on a photo: a faint diagonal pattern (hard to crop or
 * paint out) and a clearer mark in the bottom-right corner. Every word is drawn
 * whole inside the picture: sizes follow the photo's short side, and pattern
 * words that would be cut by an edge or overlap the corner mark are left out.
 */
function drawWatermark(ctx, fullWidth, fullHeight, safeAspect) {
  // Where the website crops a photo to a shape (reel covers 9:16), keep
  // the whole watermark inside the centre part that stays visible.
  let width = fullWidth;
  let height = fullHeight;
  if (safeAspect) {
    if (fullWidth / fullHeight > safeAspect) width = Math.round(fullHeight * safeAspect);
    else height = Math.round(fullWidth / safeAspect);
  }
  ctx.save();
  ctx.translate((fullWidth - width) / 2, (fullHeight - height) / 2);
  const short = Math.min(width, height);
  const margin = Math.max(6, Math.round(short / 40));

  // Corner mark: at most 60% of the width, so it never runs off a narrow photo.
  const mark = `© ${WATERMARK}`;
  const corner = fitFont(ctx, mark, Math.max(11, Math.round(short / 24)), width * 0.6);
  ctx.font = WATERMARK_FONT(corner);
  const markBox = { x: width - margin - ctx.measureText(mark).width - corner / 2, y: height - margin - corner * 1.5 };

  // Pattern: small enough that several whole words fit across the photo.
  const tilted = (w, h) => Math.abs(w * Math.cos(ANGLE)) + Math.abs(h * Math.sin(ANGLE));
  let size = Math.max(10, Math.round(short / 32));
  ctx.font = WATERMARK_FONT(size);
  while (size > 10 && tilted(ctx.measureText(WATERMARK).width, size) > width * 0.55) {
    size -= 1;
    ctx.font = WATERMARK_FONT(size);
  }
  const textW = ctx.measureText(WATERMARK).width;
  const stepX = textW + size * 1.2;
  const stepY = size * 3;
  const cos = Math.cos(ANGLE);
  const sin = Math.sin(ANGLE);
  // Where a pattern word lands on the photo: its four corners after the tilt.
  const fitsAt = (cx, cy) =>
    [
      [-textW / 2, -size * 0.6],
      [textW / 2, -size * 0.6],
      [textW / 2, size * 0.6],
      [-textW / 2, size * 0.6],
    ].every(([dx, dy]) => {
      const px = width / 2 + (cx + dx) * cos - (cy + dy) * sin;
      const py = height / 2 + (cx + dx) * sin + (cy + dy) * cos;
      const inside = px >= margin && px <= width - margin && py >= margin && py <= height - margin;
      return inside && !(px >= markBox.x && py >= markBox.y);
    });

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Light text with a dark outline, so it reads on light and dark photos alike.
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, size / 14);
  ctx.translate(width / 2, height / 2);
  ctx.rotate(ANGLE);
  const reach = Math.hypot(width, height) / 2 + stepX;
  for (let row = -Math.ceil(reach / stepY); row <= Math.ceil(reach / stepY); row += 1) {
    const y = row * stepY;
    const shift = Math.abs(row % 2) * (stepX / 2);
    for (let x = -reach + shift; x <= reach; x += stepX) {
      if (!fitsAt(x, y)) continue;
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#000';
      ctx.strokeText(WATERMARK, x, y);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#fff';
      ctx.fillText(WATERMARK, x, y);
    }
  }
  ctx.restore();

  ctx.save();
  ctx.font = WATERMARK_FONT(corner);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = corner / 3;
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#fff';
  ctx.fillText(mark, width - margin, height - margin);
  ctx.restore();
  ctx.restore();
}

// The shape a reel cover is cropped to on the website (see drawWatermark). Product
// photos are shown whole (components/common/ProductPhoto.jsx), so they need none.
export const REEL_COVER_ASPECT = 9 / 16;

/**
 * Resizes a photo in the browser (WebP, longest side `maxEdge`: 1600 for
 * products, up to 3200 for large-screen advertisements), stamps the watermark
 * (`watermark: false` for logos) and uploads it. Returns its URL.
 */
export async function uploadPhoto(file, { maxEdge = MAX_EDGE, watermark = true, safeAspect = null } = {}) {
  if (!/^image\//.test(file.type)) throw new ApiError(415, 'Choose a photo (JPEG, PNG or WebP)');
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new ApiError(415, 'This photo could not be read. Try a JPEG or PNG.');
  });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  if (watermark) drawWatermark(ctx, canvas.width, canvas.height, safeAspect);
  let blob = null;
  // Safari cannot encode WebP and hands back a large PNG instead: use JPEG there.
  const probe = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.86));
  const type = probe?.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
  for (const quality of [0.86, 0.75, 0.6]) {
    blob = type === 'image/webp' && quality === 0.86 ? probe : await new Promise((r) => canvas.toBlob(r, type, quality));
    if (blob && blob.size <= MAX_BYTES) break;
  }
  if (!blob || blob.size > MAX_BYTES) throw new ApiError(413, 'This photo is too large even after resizing');
  const { url } = await api('images', { method: 'POST', body: { dataUrl: await toDataUrl(blob) } });
  return url;
}

/** Downloads a photo already on the site, watermarks it and uploads the copy. Returns the new URL. */
export async function watermarkCopy(src, { safeAspect = null } = {}) {
  const res = await fetch(src).catch(() => null);
  if (!res?.ok) throw new ApiError(0, 'The photo could not be downloaded');
  return uploadPhoto(await res.blob(), { safeAspect });
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
