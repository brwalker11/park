#!/usr/bin/env python3
"""
WebP Image Optimizer for Monetize Parking website.
Resizes and compresses WebP images to improve PageSpeed scores.
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is not installed. Run: pip install Pillow")
    sys.exit(1)


def get_webp_files(directory):
    """Find all .webp files in the directory tree."""
    webp_files = []
    for root, dirs, files in os.walk(directory):
        # Skip hidden directories and common non-image directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '.git']]
        for file in files:
            if file.lower().endswith('.webp'):
                webp_files.append(os.path.join(root, file))
    return sorted(webp_files)


def get_file_size_kb(filepath):
    """Get file size in KB."""
    return os.path.getsize(filepath) / 1024


def format_size(kb):
    """Format size in KB or MB as appropriate."""
    if kb >= 1024:
        return f"{kb/1024:.2f} MB"
    return f"{kb:.1f} KB"


def optimize_image(filepath, max_width, quality, dry_run=False):
    """
    Optimize a single WebP image.

    Returns:
        tuple: (original_size_kb, new_size_kb, was_resized, original_dimensions, new_dimensions)
    """
    original_size = get_file_size_kb(filepath)

    with Image.open(filepath) as img:
        original_dimensions = img.size
        width, height = img.size
        was_resized = False
        new_dimensions = original_dimensions

        # Check if resize is needed
        if width > max_width:
            ratio = max_width / width
            new_height = int(height * ratio)
            new_dimensions = (max_width, new_height)
            was_resized = True

            if not dry_run:
                img = img.resize(new_dimensions, Image.Resampling.LANCZOS)

        if dry_run:
            # For dry run, estimate the new size based on quality reduction
            # This is an approximation - actual results may vary
            if was_resized:
                # Estimate size reduction from resize
                resize_ratio = (new_dimensions[0] * new_dimensions[1]) / (original_dimensions[0] * original_dimensions[1])
                estimated_size = original_size * resize_ratio * (quality / 100)
            else:
                # Just quality reduction
                estimated_size = original_size * (quality / 100) * 1.1  # Conservative estimate
            return original_size, estimated_size, was_resized, original_dimensions, new_dimensions

        # Save with new quality
        img.save(filepath, 'WEBP', quality=quality, method=6)

    new_size = get_file_size_kb(filepath)
    return original_size, new_size, was_resized, original_dimensions, new_dimensions


def main():
    parser = argparse.ArgumentParser(description='Optimize WebP images for web performance')
    parser.add_argument('directory', help='Directory to scan for WebP images')
    parser.add_argument('--max-width', type=int, default=2800, help='Maximum width in pixels (default: 2800)')
    parser.add_argument('--quality', type=int, default=85, help='WebP quality 1-100 (default: 85)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')

    args = parser.parse_args()

    if not os.path.isdir(args.directory):
        print(f"Error: '{args.directory}' is not a valid directory")
        sys.exit(1)

    if args.quality < 1 or args.quality > 100:
        print("Error: Quality must be between 1 and 100")
        sys.exit(1)

    webp_files = get_webp_files(args.directory)

    if not webp_files:
        print("No WebP files found.")
        return

    print(f"{'DRY RUN - ' if args.dry_run else ''}WebP Image Optimizer")
    print(f"{'=' * 60}")
    print(f"Directory: {os.path.abspath(args.directory)}")
    print(f"Max width: {args.max_width}px")
    print(f"Quality: {args.quality}")
    print(f"Files found: {len(webp_files)}")
    print(f"{'=' * 60}\n")

    total_original = 0
    total_new = 0
    files_resized = 0
    files_compressed = 0

    for filepath in webp_files:
        relative_path = os.path.relpath(filepath, args.directory)

        try:
            original_size, new_size, was_resized, orig_dims, new_dims = optimize_image(
                filepath, args.max_width, args.quality, args.dry_run
            )

            total_original += original_size
            total_new += new_size

            if was_resized:
                files_resized += 1

            savings = original_size - new_size
            savings_pct = (savings / original_size * 100) if original_size > 0 else 0

            if savings > 0:
                files_compressed += 1

            # Status indicators
            resize_indicator = f" [RESIZE: {orig_dims[0]}x{orig_dims[1]} -> {new_dims[0]}x{new_dims[1]}]" if was_resized else ""
            savings_indicator = f" (-{format_size(savings)}, -{savings_pct:.1f}%)" if savings > 0 else " (no change)"

            print(f"{relative_path}")
            print(f"  {format_size(original_size)} -> {format_size(new_size)}{savings_indicator}{resize_indicator}")

        except Exception as e:
            print(f"{relative_path}: ERROR - {e}")

    # Summary
    total_savings = total_original - total_new
    total_pct = (total_savings / total_original * 100) if total_original > 0 else 0

    print(f"\n{'=' * 60}")
    print("SUMMARY")
    print(f"{'=' * 60}")
    print(f"Total files processed: {len(webp_files)}")
    print(f"Files resized: {files_resized}")
    print(f"Files with size reduction: {files_compressed}")
    print(f"Original total size: {format_size(total_original)}")
    print(f"{'Estimated new' if args.dry_run else 'New'} total size: {format_size(total_new)}")
    print(f"{'Estimated savings' if args.dry_run else 'Total savings'}: {format_size(total_savings)} ({total_pct:.1f}%)")

    if args.dry_run:
        print(f"\n{'=' * 60}")
        print("This was a DRY RUN. No files were modified.")
        print("Run without --dry-run to apply changes.")
        print(f"{'=' * 60}")


if __name__ == '__main__':
    main()
