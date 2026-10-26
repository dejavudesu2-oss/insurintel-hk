"""
InsurIntel HK - Privacy Sanitizer & Anti-Watermark Pipeline
Neutralizes visible agent code markings and invisible frequency-domain steganography.
"""

import sys
import os
import io
import argparse
from typing import Tuple, Optional
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import numpy as np

class PrivacySanitizer:
    def __init__(self, quality: int = 88, noise_level: float = 0.8):
        """
        :param quality: JPEG/WebP re-compression quality to break quantization tables
        :param noise_level: Perturbation factor (0.5% - 1.5%) to disrupt LSB/DCT steganography
        """
        self.quality = quality
        self.noise_level = noise_level

    def strip_metadata(self, image: Image.Image) -> Image.Image:
        """
        Strips all EXIF, TIFF, XMP, and device-identifying metadata
        by rebuilding image data directly from raw RGB/RGBA pixels.
        """
        mode = image.mode
        if mode not in ("RGB", "RGBA", "L"):
            image = image.convert("RGB")
            mode = "RGB"

        # Create a completely fresh image instance with purely raw pixel buffers
        clean_img = Image.new(mode, image.size)
        pixel_data = list(image.get_flattened_data()) if hasattr(image, "get_flattened_data") else list(image.getdata())
        clean_img.putdata(pixel_data)
        clean_img.info.clear() # Clear all metadata dictionaries
        return clean_img

    def neutralize_invisible_watermark(self, image: Image.Image) -> Image.Image:
        """
        Neutralizes invisible steganographic watermarks embedded in Discrete Cosine
        Transform (DCT) coefficients, Wavelet transforms, or Least Significant Bits (LSB).
        
        Technique:
        1. Micro-resampling: downscale and upscale by 0.2% to desynchronize grid alignment
        2. High-frequency micro-jitter (Laplacian/Gaussian subtle perturbation)
        3. Color quantization table disruption via controlled re-encoding
        """
        # Step 1: Micro-resample to disrupt pixel-grid alignment
        orig_w, orig_h = image.size
        # Slightly shrink and scale back using high quality Bicubic/Lanczos
        temp_w = max(1, int(orig_w * 0.998))
        temp_h = max(1, int(orig_h * 0.998))
        resampled = image.resize((temp_w, temp_h), Image.Resampling.BILINEAR)
        restored = resampled.resize((orig_w, orig_h), Image.Resampling.BICUBIC)

        # Step 2: Inject sub-perceptual high-frequency noise using NumPy
        np_img = np.array(restored, dtype=np.float32)
        noise = np.random.normal(0.0, self.noise_level, np_img.shape)
        perturbed = np.clip(np_img + noise, 0, 255).astype(np.uint8)
        perturbed_img = Image.fromarray(perturbed)

        # Step 3: Re-encode to memory buffer to destroy raw bitplane consistency
        buffer = io.BytesIO()
        if restored.mode == "RGBA":
            # Convert RGBA to RGB with white background if saving as JPEG
            bg = Image.new("RGB", restored.size, (255, 255, 255))
            bg.paste(perturbed_img, mask=perturbed_img.split()[3])
            bg.save(buffer, format="JPEG", quality=self.quality, optimize=True)
        else:
            perturbed_img.save(buffer, format="JPEG", quality=self.quality, optimize=True)

        buffer.seek(0)
        return Image.open(buffer)

    def mask_watermark_bands(self, image: Image.Image, bounding_boxes: Optional[list] = None) -> Image.Image:
        """
        Blurs or masks detected visible agent watermark bands (e.g. diagonal agent IDs).
        If bounding_boxes is provided, applies localized heavy blur.
        """
        img_out = image.copy()
        if not bounding_boxes:
            # Default edge margin heuristic: masks top-right / bottom-right typical agent stamps
            w, h = img_out.size
            # Top-right header stamp margin (often contains internal agent codes)
            bounding_boxes = [
                (int(w * 0.70), 0, w, int(h * 0.08)), # Header stamp
                (int(w * 0.65), int(h * 0.92), w, h)  # Footer advisor signature
            ]

        for box in bounding_boxes:
            x1, y1, x2, y2 = box
            x1 = max(0, min(x1, img_out.width))
            y1 = max(0, min(y1, img_out.height))
            x2 = max(0, min(x2, img_out.width))
            y2 = max(0, min(y2, img_out.height))
            if x2 > x1 and y2 > y1:
                crop = img_out.crop((x1, y1, x2, y2))
                blurred_crop = crop.filter(ImageFilter.GaussianBlur(radius=8))
                img_out.paste(blurred_crop, (x1, y1))

        return img_out

    def process(self, input_path: str, output_path: str, blur_default_stamps: bool = True) -> dict:
        """
        End-to-end sanitization pipeline.
        """
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input image not found: {input_path}")

        with Image.open(input_path) as raw_img:
            # 1. Strip all metadata
            clean_meta = self.strip_metadata(raw_img)

            # 2. Mask visible stamps/boxes if requested
            if blur_default_stamps:
                masked_img = self.mask_watermark_bands(clean_meta)
            else:
                masked_img = clean_meta

            # 3. Neutralize steganographic invisible watermarks
            final_img = self.neutralize_invisible_watermark(masked_img)

            # 4. Save to destination
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            final_img.save(output_path, format="JPEG", quality=self.quality, optimize=True)

        return {
            "status": "success",
            "input": input_path,
            "output": output_path,
            "metadata_stripped": True,
            "anti_watermark_applied": True
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="InsurIntel HK - Privacy Sanitizer")
    parser.add_argument("input", nargs="?", help="Path to input image/flyer")
    parser.add_argument("output", nargs="?", help="Path to output sanitized image")
    parser.add_argument("--test", action="store_true", help="Generate a synthetic test flyer and sanitize it")

    args = parser.parse_args()
    sanitizer = PrivacySanitizer()

    if args.test or (not args.input and not args.output):
        # Generate synthetic demo flyer to test the sanitizer
        print("[InsurIntel] Generating synthetic test flyer with watermark...")
        test_dir = os.path.join(os.path.dirname(__file__), "..", "..", "tmp")
        os.makedirs(test_dir, exist_ok=True)
        raw_test_path = os.path.join(test_dir, "synthetic_raw_flyer.jpg")
        clean_test_path = os.path.join(test_dir, "sanitized_flyer.jpg")

        # Create a test flyer image with metadata and an agent stamp
        demo_img = Image.new("RGB", (800, 1000), color=(250, 250, 252))
        from PIL import ImageDraw
        draw = ImageDraw.Draw(demo_img)
        draw.text((40, 40), "PRUDENTIAL / AIA PROMO CIRCULAR - 2026 Q4", fill=(10, 30, 80))
        draw.text((40, 80), "PREPAYMENT RATE: 5.8% p.a. GUARANTEED 1 YEAR", fill=(180, 20, 20))
        draw.text((40, 120), "First Year Premium Discount: Up to 28%", fill=(30, 30, 30))
        # Simulated agent watermark stamp on top right
        draw.rectangle([560, 20, 780, 60], fill=(230, 230, 240))
        draw.text((570, 30), "Agent Code: D888999 (Confidential)", fill=(120, 0, 0))

        demo_img.save(raw_test_path, "JPEG")
        res = sanitizer.process(raw_test_path, clean_test_path)
        print(f"[InsurIntel] Sanitization Complete! Result: {res}")
        print(f"[InsurIntel] Clean image saved to: {clean_test_path}")
    else:
        res = sanitizer.process(args.input, args.output)
        print(f"[InsurIntel] Successfully sanitized {args.input} -> {args.output}")
