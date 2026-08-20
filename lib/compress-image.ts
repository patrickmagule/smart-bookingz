// lib/compress-image.ts
export async function compressImage(file: File, maxKb = 100): Promise<File> {
    const maxBytes = maxKb * 1024;

    // If already under target size, return original file
    if (file.size <= maxBytes) return file;

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = async () => {
            URL.revokeObjectURL(url);

            let width = img.width;
            let height = img.height;

            // Start with max dimension of 1280px for aggressive initial reduction
            const maxDimension = 1280;
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            let quality = 0.75;
            let blob: Blob | null = null;

            // Iteratively reduce quality/size until <= 100 KB
            while (quality > 0.1) {
                canvas.width = width;
                canvas.height = height;
                ctx = canvas.getContext("2d");
                if (!ctx) break;

                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                blob = await new Promise<Blob | null>((res) =>
                    canvas.toBlob(res, "image/webp", quality)
                );

                if (blob && blob.size <= maxBytes) {
                    break;
                }

                // Drop quality first, then scale down dimensions if quality gets too low
                quality -= 0.15;
                if (quality < 0.4 && (width > 600 || height > 600)) {
                    width = Math.round(width * 0.8);
                    height = Math.round(height * 0.8);
                }
            }

            if (!blob) return resolve(file);

            const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                {
                    type: "image/webp",
                    lastModified: Date.now(),
                }
            );

            resolve(compressedFile);
        };

        img.onerror = () => resolve(file);
        img.src = url;
    });
}