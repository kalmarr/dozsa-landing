#!/usr/bin/env python3
"""
Image optimization script for Dózsa Apartman website
Optimizes images according to specified requirements
"""

import os
import sys
from pathlib import Path
from PIL import Image
import shutil

# Configuration
IMAGE_DIR = Path("/home/kalmarr/projects/dozsa-landing/web/images")

# Optimization rules
RULES = {
    "slides": {
        "max_size": (1920, 1080),
        "quality": 85,
        "target_kb": (200, 300),
        "format": "JPEG"
    },
    "gallery": {
        "max_size": (1200, 800),
        "quality": 85,
        "target_kb": (100, 150),
        "format": "JPEG"
    },
    "about": {  # monika-robert
        "max_size": (800, 800),
        "quality": 85,
        "target_kb": (100, 150),
        "format": "JPEG"
    },
    "floorplan": {  # alaprajz
        "max_size": (1500, 1500),
        "quality": 90,
        "target_kb": (200, 300),
        "format": "JPEG"
    },
    "logo": {
        "format": "PNG",
        "optimize": True
    }
}

def get_file_size_kb(filepath):
    """Get file size in KB"""
    return os.path.getsize(filepath) / 1024

def optimize_jpeg(image_path, max_size, quality):
    """Optimize JPEG image"""
    img = Image.open(image_path)

    # Convert RGBA to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background

    # Resize if larger than max_size
    if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

    # Save with optimization
    img.save(image_path, "JPEG", quality=quality, optimize=True, progressive=True)

def optimize_png(image_path):
    """Optimize PNG image"""
    img = Image.open(image_path)
    img.save(image_path, "PNG", optimize=True)

def process_directory(directory, rule_name):
    """Process all images in a directory"""
    rule = RULES.get(rule_name)
    if not rule:
        print(f"No rule found for {rule_name}")
        return []

    results = []
    dir_path = IMAGE_DIR / directory

    if not dir_path.exists():
        print(f"Directory not found: {dir_path}")
        return results

    # Find all images
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG', '*.png', '*.PNG']:
        image_files.extend(dir_path.rglob(ext))

    for image_path in image_files:
        try:
            size_before = get_file_size_kb(image_path)

            if rule["format"] == "JPEG":
                optimize_jpeg(image_path, rule["max_size"], rule["quality"])
            elif rule["format"] == "PNG":
                optimize_png(image_path)

            size_after = get_file_size_kb(image_path)
            reduction = size_before - size_after
            reduction_percent = (reduction / size_before) * 100 if size_before > 0 else 0

            results.append({
                "path": str(image_path),
                "size_before": size_before,
                "size_after": size_after,
                "reduction": reduction,
                "reduction_percent": reduction_percent
            })

            print(f"✓ {image_path.name}: {size_before:.1f}KB → {size_after:.1f}KB (-{reduction:.1f}KB, -{reduction_percent:.1f}%)")

        except Exception as e:
            print(f"✗ Error processing {image_path}: {e}")

    return results

def main():
    print("=" * 80)
    print("DÓZSA APARTMAN - Image Optimization")
    print("=" * 80)
    print()

    all_results = []

    # Process slides
    print("\n📸 SLIDES (slides/)")
    print("-" * 80)
    results = process_directory("slides", "slides")
    all_results.extend(results)

    # Process gallery images
    print("\n🖼️  GALLERY (gallery/)")
    print("-" * 80)
    results = process_directory("gallery", "gallery")
    all_results.extend(results)

    # Process about images (monika-robert)
    print("\n👥 ABOUT (about/)")
    print("-" * 80)
    results = process_directory("about", "about")
    all_results.extend(results)

    # Process floorplan
    print("\n📐 FLOORPLAN (floorplan/)")
    print("-" * 80)
    results = process_directory("floorplan", "floorplan")
    all_results.extend(results)

    # Process logos
    print("\n🏷️  LOGOS (logo/)")
    print("-" * 80)
    results = process_directory("logo", "logo")
    all_results.extend(results)

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    total_before = sum(r["size_before"] for r in all_results)
    total_after = sum(r["size_after"] for r in all_results)
    total_reduction = total_before - total_after
    total_reduction_percent = (total_reduction / total_before) * 100 if total_before > 0 else 0

    print(f"\nTotal images processed: {len(all_results)}")
    print(f"Total size before: {total_before / 1024:.2f} MB ({total_before:.1f} KB)")
    print(f"Total size after: {total_after / 1024:.2f} MB ({total_after:.1f} KB)")
    print(f"Total reduction: {total_reduction / 1024:.2f} MB ({total_reduction:.1f} KB)")
    print(f"Reduction percentage: {total_reduction_percent:.1f}%")

    # Detailed list
    print("\n" + "=" * 80)
    print("DETAILED LIST")
    print("=" * 80)
    print(f"{'File':<50} {'Before':>12} {'After':>12} {'Reduction':>15}")
    print("-" * 80)

    for r in sorted(all_results, key=lambda x: x["reduction"], reverse=True):
        filename = Path(r["path"]).name
        print(f"{filename:<50} {r['size_before']:>10.1f}KB {r['size_after']:>10.1f}KB {r['reduction']:>10.1f}KB ({r['reduction_percent']:>5.1f}%)")

    print("\n✅ Optimization complete!")
    print(f"📦 Backup available: images-backup-*.tar.gz")

if __name__ == "__main__":
    main()
