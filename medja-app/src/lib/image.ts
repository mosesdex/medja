/**
 * Client-side image compression: downscale to maxDim and JPEG-encode until the
 * blob is under ~targetKB. Keeps field uploads cheap on 3G / low-end Androids.
 */
export async function compressImage(
  file: File,
  { maxDim = 1280, targetKB = 200 }: { maxDim?: number; targetKB?: number } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  let quality = 0.85;
  let blob = await toBlob(canvas, quality);
  while (blob.size > targetKB * 1024 && quality > 0.4) {
    quality -= 0.15;
    blob = await toBlob(canvas, quality);
  }
  return blob;
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("compression failed"))),
      "image/jpeg",
      quality,
    ),
  );
}
