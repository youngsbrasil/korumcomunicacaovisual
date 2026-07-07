// Client-side image compression using canvas.
// Preserves visual quality while reducing file size (WebP re-encode).

export type CompressResult = {
  file: File;
  ext: string;
  originalSize: number;
  finalSize: number;
  compressed: boolean;
};

const MAX_DIMENSION = 2200; // px on longest side
const QUALITY = 0.85;
const MIN_SAVINGS_RATIO = 0.9; // only keep re-encoded if <= 90% of original

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image decode failed"));
      img.src = url;
    });
    return img;
  } finally {
    // Revoke later; image already in memory
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size;
  const nameLower = file.name.toLowerCase();
  const isCompressible = /\.(jpe?g|png|webp)$/.test(nameLower);

  // Skip small files (<200KB) and non-compressible formats (gif, etc.)
  if (!isCompressible || originalSize < 200 * 1024) {
    const ext = (nameLower.split(".").pop() || "bin").toLowerCase();
    return { file, ext, originalSize, finalSize: originalSize, compressed: false };
  }

  try {
    const img = await loadImage(file);
    const { width, height } = img;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const outW = Math.round(width * scale);
    const outH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas ctx");
    ctx.drawImage(img, 0, 0, outW, outH);

    const blob = await canvasToBlob(canvas, "image/webp", QUALITY);
    if (!blob) throw new Error("encode failed");

    // Only accept if noticeably smaller
    if (blob.size > originalSize * MIN_SAVINGS_RATIO) {
      const ext = (nameLower.split(".").pop() || "bin").toLowerCase();
      return { file, ext, originalSize, finalSize: originalSize, compressed: false };
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const newFile = new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
    return {
      file: newFile,
      ext: "webp",
      originalSize,
      finalSize: blob.size,
      compressed: true,
    };
  } catch {
    const ext = (nameLower.split(".").pop() || "bin").toLowerCase();
    return { file, ext, originalSize, finalSize: originalSize, compressed: false };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
