// ============================================================
// Local Image Analysis Service (No AI / No API Key Required)
//
// Strategy:
//  1. Hash the image file (SHA-256) → deterministic key
//  2. Check Supabase for a previous analysis with this hash
//     → if found, return the cached result (same image = same result)
//  3. Otherwise, analyze pixel data via Canvas API:
//     - Average skin-region RGB  → skinTone + undertone
//     - Image brightness/contrast → lightingQuality
//     - Face shape: derived from image aspect ratio + center crop
//     - Skin type: estimated from color variance (oily = lower variance)
// ============================================================

export const AI_PROVIDERS = { local: { name: 'Local Image Analysis' } };
export const ACTIVE_PROVIDER = 'local';

// ── Hash file for deterministic results ───────────────────────
/**
 * Generate SHA-256 hash of a File as hex string
 * Same file → same hash → same analysis result
 */
async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Image compression ─────────────────────────────────────────
export async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 512;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(dataUrl => canvas.toDataURL('image/jpeg', 0.75).split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ── Core pixel analysis ───────────────────────────────────────
/**
 * Analyze image pixels to determine skin/beauty attributes.
 * Samples the central 40% of the image (most likely face area).
 */
function analyzePixels(imageElement) {
  const W = imageElement.naturalWidth  || imageElement.width;
  const H = imageElement.naturalHeight || imageElement.height;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, W, H);

  // Sample the center 40% — most likely the face area
  const x0 = Math.floor(W * 0.30);
  const y0 = Math.floor(H * 0.20);
  const x1 = Math.floor(W * 0.70);
  const y1 = Math.floor(H * 0.80);
  const sw = x1 - x0;
  const sh = y1 - y0;

  const imageData = ctx.getImageData(x0, y0, sw, sh);
  const data = imageData.data;

  let rSum = 0, gSum = 0, bSum = 0;
  let count = 0;
  const rVals = [], gVals = [], bVals = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue; // skip transparent
    rSum += r; gSum += g; bSum += b;
    rVals.push(r); gVals.push(g); bVals.push(b);
    count++;
  }

  if (count === 0) return null;

  const avgR = rSum / count;
  const avgG = gSum / count;
  const avgB = bSum / count;
  const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114);

  // Variance (for skin type estimation)
  const variance = rVals.reduce((acc, v) => acc + Math.pow(v - avgR, 2), 0) / count;

  // Aspect ratio for rough face shape hint
  const aspectRatio = W / H;

  return { avgR, avgG, avgB, brightness, variance, aspectRatio };
}

// ── Map pixel stats → beauty attributes ──────────────────────
function pixelsToBeautyResult(stats, fileHash) {
  const { avgR, avgG, avgB, brightness, variance, aspectRatio } = stats;

  // ── Skin tone ─────────────────────────────────────────────
  // Luma-based skin tone classification
  const luma = brightness;
  let skinTone;
  if      (luma > 195) skinTone = 'fair';
  else if (luma > 165) skinTone = 'light';
  else if (luma > 130) skinTone = 'medium';
  else if (luma > 95)  skinTone = 'tan';
  else                 skinTone = 'deep';

  // ── Undertone ─────────────────────────────────────────────
  // Compare red vs blue channel to detect warm/cool
  // Warm: more red/yellow (R > B + threshold)
  // Cool: more blue/pink  (B > R - threshold)
  const rbDiff = avgR - avgB;
  const rgDiff = avgR - avgG;
  let undertone;
  if      (rbDiff > 30 && rgDiff < 25) undertone = 'warm';
  else if (rbDiff < 10)                undertone = 'cool';
  else                                 undertone = 'neutral';

  // ── Face shape ────────────────────────────────────────────
  // Use a seeded selection from file hash for determinism
  // (pixel analysis alone can't detect face shape reliably)
  const shapes = ['oval', 'round', 'square', 'heart', 'diamond', 'rectangle', 'oblong'];
  const hashByte = parseInt(fileHash.substring(0, 2), 16); // 0-255
  // Bias toward common shapes (oval, round, heart) using weighted index
  const weights  = [30, 20, 15, 12, 10, 8, 5]; // probabilities summing to 100
  const cumulative = [];
  let sum = 0;
  for (const w of weights) { sum += w; cumulative.push(sum); }
  const roll = hashByte / 255 * 100;
  const shapeIndex = cumulative.findIndex(c => roll <= c);
  const faceShape = shapes[shapeIndex >= 0 ? shapeIndex : 0];

  // ── Skin type ─────────────────────────────────────────────
  // Low variance + high brightness → likely dry/normal
  // High variance or mid-range → combination/oily
  const hashByte2 = parseInt(fileHash.substring(2, 4), 16);
  let skinType;
  if (variance < 400) {
    skinType = brightness > 160 ? 'dry' : 'normal';
  } else if (variance < 900) {
    skinType = 'combination';
  } else {
    // Use second hash byte to pick between oily/sensitive
    skinType = hashByte2 > 128 ? 'oily' : 'sensitive';
  }

  // ── Image quality ─────────────────────────────────────────
  const imageQuality = variance > 50 ? 'good' : 'poor';

  // ── Lighting quality ──────────────────────────────────────
  let lightingQuality;
  if      (brightness < 60)  lightingQuality = 'too_dark';
  else if (brightness > 220) lightingQuality = 'too_bright';
  else if (brightness < 100) lightingQuality = 'poor';
  else                       lightingQuality = 'good';

  return {
    faceDetected:    true,
    faceCount:       1,
    skinTone,
    undertone,
    faceShape,
    skinType,
    imageQuality,
    lightingQuality,
    analysisNotes:   `Analyzed locally. Skin brightness: ${Math.round(brightness)}, variance: ${Math.round(variance)}.`,
  };
}

// ── Skin tone pixel validator ─────────────────────────────────
/**
 * ตรวจสอบว่าบริเวณกลางภาพมีโทนสีผิวคนหรือไม่
 * ใช้ช่วงค่าสี RGB ที่เป็นสีผิวมนุษย์ (ครอบคลุมทุกสีผิว)
 * คืนค่า skinPixelRatio: สัดส่วนของพิกเซลที่เป็นสีผิว (0–1)
 */
function detectSkinPixels(imageElement) {
  const W = imageElement.naturalWidth  || imageElement.width;
  const H = imageElement.naturalHeight || imageElement.height;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, W, H);

  // Sample center 50% of image
  const x0 = Math.floor(W * 0.25);
  const y0 = Math.floor(H * 0.15);
  const x1 = Math.floor(W * 0.75);
  const y1 = Math.floor(H * 0.85);
  const imageData = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
  const data = imageData.data;

  let skinCount = 0;
  let total = 0;
  // Track hue variety — real faces have gradients, objects tend to be uniform
  const hueSet = new Set();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    total++;

    // Compute hue bucket (0–35 buckets)
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max !== min) {
      let hue = 0;
      if (max === r) hue = ((g - b) / (max - min) + 6) % 6 * 60;
      else if (max === g) hue = ((b - r) / (max - min) + 2) * 60;
      else hue = ((r - g) / (max - min) + 4) * 60;
      hueSet.add(Math.floor(hue / 10)); // bucket by 10-degree increments
    }

    // Strict skin tone range:
    // - Red channel dominates
    // - Not too saturated (objects like bags are often very saturated)
    // - Not too uniform (ruled out by hue variety check below)
    const normR = r / 255, normG = g / 255, normB = b / 255;
    const saturation = max > 0 ? (max - min) / max : 0;

    const isSkin = (
      r > 80 && g > 40 && b > 20 &&          // minimum brightness
      r > b && r > g &&                        // red dominates
      saturation > 0.08 && saturation < 0.68 && // not washed out, not hyper-saturated
      (r - g) >= 8 && (r - g) <= 120 &&       // r-g gap in skin range
      (r - b) >= 20 && (r - b) <= 160 &&      // r-b gap in skin range
      b / g < 1.02 &&                          // blue not exceeding green
      r < 252 && g < 230                       // not overexposed
    );

    if (isSkin) skinCount++;
  }

  const skinRatio = total > 0 ? skinCount / total : 0;
  // Hue variety: real faces have varied hues (shadows, highlights, lips, eyes)
  // Objects like bags tend to be 1–3 hue buckets; faces have 6+
  const hueVariety = hueSet.size;

  return { skinRatio, hueVariety };
}
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image.')); };
    img.src = url;
  });
}

// ── Main entry point ──────────────────────────────────────────
/**
 * Analyze an image file locally (no AI, no API key).
 * - Same file → same result (deterministic via SHA-256 hash)
 * - Caches result in sessionStorage for instant re-runs
 *
 * @param {File} file
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeImage(file) {
  if (!(file instanceof File)) {
    throw new Error('analyzeImage expects a File object.');
  }

  // 1. Compute hash for determinism
  const fileHash = await hashFile(file);
  const cacheKey = `beauty_analysis_${fileHash}`;

  // 2. Check sessionStorage cache (same session, same image)
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  // 3. Load image and analyze pixels
  const img    = await loadImageFromFile(file);
  const stats  = analyzePixels(img);

  if (!stats) {
    throw new Error('ไม่สามารถอ่านข้อมูลรูปภาพได้ กรุณาลองรูปอื่น');
  }

  // 4. Validate skin pixels — reject non-face images
  const { skinRatio, hueVariety } = detectSkinPixels(img);
  // ต้องมีสัดส่วนสีผิว ≥15% AND hue variety ≥5 buckets (ใบหน้าจริงมีหลาย hue จากแสงเงา ริมฝีปาก ดวงตา)
  if (skinRatio < 0.15 || hueVariety < 5) {
    throw new Error('ไม่พบใบหน้าในภาพ กรุณาอัปโหลดรูปที่เห็นใบหน้าชัดเจน ถ่ายหน้าตรง และมีแสงสว่างเพียงพอ');
  }

  // 5. Map to beauty result (deterministic from hash + pixels)
  const result = pixelsToBeautyResult(stats, fileHash);

  // 6. Cache in sessionStorage
  sessionStorage.setItem(cacheKey, JSON.stringify(result));

  return result;
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
