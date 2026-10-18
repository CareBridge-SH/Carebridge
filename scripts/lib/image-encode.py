#!/usr/bin/env python3
"""
Encode pictures for the site in one pass. Called by
`scripts/ingest-instagram-folder.mjs` and `scripts/rotate-plate-photos.mjs`; not
usually run by hand, though it takes the same JSON on stdin if you want to.

    python -X utf8 scripts/lib/image-encode.py < jobs.json > results.json

Each job:

    { "src": <path>, "dst": <path>, "maxWidth": 1080 }                  # shrink only
    { "src": <path>, "dst": <path>, "crop": "3:2", "width": 1800 }      # crop, then size

Each result: `{ "dst", "width", "height", "bytes" }`.

Why Python and not Node: this machine has no image encoder for Node (no sharp,
no jimp, and `magick`/`cwebp` are not installed), but it does have Pillow — which
is also what converted the event photographs. The alternative was shipping
whatever a phone produced, and an Instagram export is 2–4 MB against a 120 KB
WebP for the same picture.

Three details that are not optional:

  * MPO files — several phone JPEGs are really MPO, a first picture plus a depth
    map or thumbnail as the second frame. Pillow opens frame 0 by default, but
    `seek(0)` makes that explicit: without it the published image can be the
    depth map, which is grey mush.

  * EXIF orientation — a phone that writes orientation 8 stores the picture
    sideways with a rotate flag. Browsers honour the flag; a resized copy that
    drops EXIF does not, so it must be baked in with `exif_transpose` BEFORE the
    resize and before the crop. One of the event photographs is exactly this case.

  * Central crop, not a squashed resize. A plate reserves a 3:2 box; forcing a
    3:4 portrait into it by scaling would distort every face in the picture. The
    crop takes the middle band and discards the rest — the caller is responsible
    for picking a picture where that is acceptable.

Saving to WebP without `exif=` drops the metadata, which is deliberate: phone
exports carry GPS coordinates, and the site publishes to the open web.
"""

import json
import os
import sys

from PIL import Image, ImageOps


def crop_to_ratio(im, ratio):
    """Centre-crop to `ratio` (width / height), never upscale, never distort."""
    width, height = im.size
    current = width / height

    if abs(current - ratio) < 1e-3:
        return im

    if current > ratio:
        # Too wide: trim the sides.
        new_width = round(height * ratio)
        left = (width - new_width) // 2
        return im.crop((left, 0, left + new_width, height))

    # Too tall: trim the top and bottom, a little above centre so that a
    # portrait of a person keeps their face rather than their feet.
    new_height = round(width / ratio)
    top = round((height - new_height) * 0.42)
    return im.crop((0, top, width, top + new_height))


def main() -> int:
    jobs = json.load(sys.stdin)
    results = []

    for job in jobs:
        src = job["src"]
        dst = job["dst"]
        quality = int(job.get("quality", 82))

        with Image.open(src) as im:
            if im.format == "MPO":
                im.seek(0)

            im = ImageOps.exif_transpose(im)

            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")

            if job.get("crop"):
                w, h = job["crop"].split(":")
                im = crop_to_ratio(im, float(w) / float(h))

            target = job.get("width") or job.get("maxWidth")
            if target:
                target = int(target)
                width, height = im.size
                if width > target:
                    im = im.resize(
                        (target, round(height * target / width)),
                        Image.LANCZOS,
                    )

            os.makedirs(os.path.dirname(dst), exist_ok=True)
            im.save(dst, "WEBP", quality=quality, method=6)

            results.append(
                {
                    "dst": dst,
                    "width": im.size[0],
                    "height": im.size[1],
                    "bytes": os.path.getsize(dst),
                }
            )

    json.dump(results, sys.stdout)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # surfaced verbatim by the Node caller
        print(f"{type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
